import { hasValidCoords } from '../../utils/territoryGeoJson'
import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { MAPBOX_STYLE_URL } from '../../constants/walk'
import { CREW_TERRITORY_MAP_IDS, TERRITORY_MAP_CONFIG } from '../../constants/territory'
import { getTerritoryMarker } from '../../utils/territoryMarker'
import { createTerritoryMarkerElement } from '../../utils/territoryMarkerElement'
import type { TerritoryBoundsParams } from '../../types/territory'
import type { CrewTerritoryItem } from '../../types/crewTerritory'

interface CrewTerritoryFeatureProperties {
  territoryId: number
  fillColor: string
  isMine: boolean
}

function toCrewTerritoryFeatureCollection(items: CrewTerritoryItem[]) {
  const features = []
  for (const item of items) {
    if (!item.polygon || !hasValidCoords(item.polygon)) continue
    features.push({
      type: 'Feature' as const,
      properties: {
        territoryId: item.id,
        fillColor: item.fillColor,
        isMine: item.isMine,
      } satisfies CrewTerritoryFeatureProperties,
      geometry: item.polygon,
    })
  }
  return { type: 'FeatureCollection' as const, features }
}

const EMPTY_COLLECTION = {
  type: 'FeatureCollection' as const,
  features: [] as ReturnType<typeof toCrewTerritoryFeatureCollection>['features'],
}

interface CrewTerritoryMapProps {
  crewId: number | null
  territories: CrewTerritoryItem[]
  onBoundsChange: (bounds: TerritoryBoundsParams) => void
  fitBoundsTarget?: [[number, number], [number, number]] | null
}

export default function CrewTerritoryMap({
  crewId,
  territories,
  onBoundsChange,
  fitBoundsTarget,
}: CrewTerritoryMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const mountedRef = useRef(true)
  const onBoundsRef = useRef(onBoundsChange)
  const dogMarkersRef = useRef<mapboxgl.Marker[]>([])
  const fittedCrewRef = useRef<number | null>(null)
  const [mapReady, setMapReady] = useState(0)
  const [mapError, setMapError] = useState<string | null>(null)

  useEffect(() => {
    onBoundsRef.current = onBoundsChange
  }, [onBoundsChange])

  useEffect(() => {
    mountedRef.current = true

    const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
    if (!token) {
      setMapError('지도를 불러올 수 없습니다.')
      return
    }
    if (!containerRef.current || mapRef.current) return

    mapboxgl.accessToken = token

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: MAPBOX_STYLE_URL,
      center: TERRITORY_MAP_CONFIG.defaultCenter,
      zoom: TERRITORY_MAP_CONFIG.defaultZoom,
      attributionControl: false,
      language: 'ko',
    })
    mapRef.current = map

    function handleLoad() {
      if (!mountedRef.current) return
      const m = mapRef.current
      if (!m) return

      if (!m.getSource(CREW_TERRITORY_MAP_IDS.source))
        m.addSource(CREW_TERRITORY_MAP_IDS.source, {
          type: 'geojson',
          data: EMPTY_COLLECTION,
        })

      if (!m.getLayer(CREW_TERRITORY_MAP_IDS.fillLayer))
        m.addLayer({
          id: CREW_TERRITORY_MAP_IDS.fillLayer,
          type: 'fill',
          source: CREW_TERRITORY_MAP_IDS.source,
          paint: {
            'fill-color': ['get', 'fillColor'],
            'fill-opacity': [
              'case',
              ['==', ['get', 'isMine'], true],
              TERRITORY_MAP_CONFIG.fillOpacityMine,
              TERRITORY_MAP_CONFIG.fillOpacityOther,
            ],
          },
        })

      if (!m.getLayer(CREW_TERRITORY_MAP_IDS.outlineLayer))
        m.addLayer({
          id: CREW_TERRITORY_MAP_IDS.outlineLayer,
          type: 'line',
          source: CREW_TERRITORY_MAP_IDS.source,
          paint: {
            'line-color': ['get', 'fillColor'],
            'line-width': TERRITORY_MAP_CONFIG.lineWidthDefault,
          },
        })

      const initialBounds = m.getBounds()
      if (initialBounds) {
        onBoundsRef.current({
          swLng: initialBounds.getWest(),
          swLat: initialBounds.getSouth(),
          neLng: initialBounds.getEast(),
          neLat: initialBounds.getNorth(),
        })
      }

      if (mountedRef.current) setMapReady((version) => version + 1)
    }

    function handleMoveEnd() {
      if (!mountedRef.current) return
      const bounds = map.getBounds()
      if (!bounds) return
      onBoundsRef.current({
        swLng: bounds.getWest(),
        swLat: bounds.getSouth(),
        neLng: bounds.getEast(),
        neLat: bounds.getNorth(),
      })
    }

    function handleError(e: mapboxgl.ErrorEvent) {
      if (!mountedRef.current) return
      console.error('[SafePaw] 크루 영토 지도 오류:', e.error)
      setMapError('지도를 불러오지 못했습니다.')
    }

    const resizeObserver = new ResizeObserver(() => {
      mapRef.current?.resize()
    })
    if (containerRef.current) resizeObserver.observe(containerRef.current)

    map.on('style.load', handleLoad)
    map.on('error', handleError)
    map.on('moveend', handleMoveEnd)

    return () => {
      mountedRef.current = false
      map.off('style.load', handleLoad)
      map.off('error', handleError)
      map.off('moveend', handleMoveEnd)
      resizeObserver.disconnect()
      dogMarkersRef.current.forEach((m) => m.remove())
      dogMarkersRef.current = []
      setMapReady(0)
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    fittedCrewRef.current = null
  }, [crewId])

  useEffect(() => {
    if (!mapReady || !fitBoundsTarget || crewId === null || fittedCrewRef.current === crewId) return
    const map = mapRef.current
    if (!map) return
    const [[minLng, minLat], [maxLng, maxLat]] = fitBoundsTarget
    fittedCrewRef.current = crewId
    map.fitBounds(
      [
        [minLng, minLat],
        [maxLng, maxLat],
      ],
      {
        padding: { top: 120, bottom: 160, left: 40, right: 40 },
        maxZoom: TERRITORY_MAP_CONFIG.maxZoomOnFit,
        duration: 500,
      },
    )
  }, [mapReady, fitBoundsTarget, crewId])

  useEffect(() => {
    if (!mapReady) return
    const map = mapRef.current
    if (!map) return
    const source = map.getSource(CREW_TERRITORY_MAP_IDS.source) as
      | mapboxgl.GeoJSONSource
      | undefined
    if (!source) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    source.setData(toCrewTerritoryFeatureCollection(territories) as any)
  }, [territories, mapReady])

  useEffect(() => {
    if (!mapReady) return
    const map = mapRef.current
    if (!map) return

    dogMarkersRef.current.forEach((m) => m.remove())
    dogMarkersRef.current = []

    for (const item of territories) {
      if (!item.polygon) continue

      const centroid = getTerritoryMarker(item)
      if (!centroid) continue

      const el = createTerritoryMarkerElement(item.dog)

      const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat(centroid)
        .addTo(map)
      dogMarkersRef.current.push(marker)
    }
  }, [territories, mapReady])

  if (mapError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-navy-8">
        <p className="text-f16 text-navy-70 text-center px-6">{mapError}</p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  )
}
