import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { MAPBOX_STYLE_URL } from '../../constants/walk'
import { CREW_TERRITORY_MAP_IDS, TERRITORY_MAP_CONFIG } from '../../constants/territory'
import { computeGeometryCentroid } from '../../utils/territoryGeoJson'
import { DEFAULT_MARKER_IMAGE_SRC, resolveMarkerImage } from '../../utils/markerImage'
import type { TerritoryBoundsParams } from '../../types/territory'
import type { CrewTerritoryItem } from '../../types/crewTerritory'

interface CrewTerritoryFeatureProperties {
  territoryId: number
  fillColor: string
  isMine: boolean
}

function hasValidCoords(polygon: CrewTerritoryItem['polygon']): boolean {
  if (polygon.type === 'Polygon') {
    return polygon.coordinates.length > 0 && (polygon.coordinates[0]?.length ?? 0) > 0
  }
  return (
    polygon.coordinates.length > 0 &&
    (polygon.coordinates[0]?.length ?? 0) > 0 &&
    (polygon.coordinates[0]?.[0]?.length ?? 0) > 0
  )
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
  territories: CrewTerritoryItem[]
  onBoundsChange: (bounds: TerritoryBoundsParams) => void
  fitBoundsTarget?: [[number, number], [number, number]] | null
}

export default function CrewTerritoryMap({
  territories,
  onBoundsChange,
  fitBoundsTarget,
}: CrewTerritoryMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const mountedRef = useRef(true)
  const onBoundsRef = useRef(onBoundsChange)
  const dogMarkersRef = useRef<mapboxgl.Marker[]>([])
  const hasFittedBoundsRef = useRef(false)
  const [mapReady, setMapReady] = useState(false)
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

      m.addSource(CREW_TERRITORY_MAP_IDS.source, {
        type: 'geojson',
        data: EMPTY_COLLECTION,
      })

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

      if (mountedRef.current) setMapReady(true)
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

    map.on('load', handleLoad)
    map.on('error', handleError)
    map.on('moveend', handleMoveEnd)

    return () => {
      mountedRef.current = false
      map.off('load', handleLoad)
      map.off('error', handleError)
      map.off('moveend', handleMoveEnd)
      resizeObserver.disconnect()
      dogMarkersRef.current.forEach((m) => m.remove())
      dogMarkersRef.current = []
      setMapReady(false)
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!mapReady || !fitBoundsTarget || hasFittedBoundsRef.current) return
    const map = mapRef.current
    if (!map) return
    const [[minLng, minLat], [maxLng, maxLat]] = fitBoundsTarget
    map.fitBounds(
      [
        [minLng, minLat],
        [maxLng, maxLat],
      ],
      {
        padding: TERRITORY_MAP_CONFIG.fitBoundsPadding,
        maxZoom: TERRITORY_MAP_CONFIG.maxZoomOnFit,
        duration: 500,
      },
    )
    hasFittedBoundsRef.current = true
  }, [mapReady, fitBoundsTarget])

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

    const seenDogIds = new Set<number>()

    for (const item of territories) {
      if (!item.polygon) continue
      if (seenDogIds.has(item.dog.id)) continue
      seenDogIds.add(item.dog.id)

      const centroid = computeGeometryCentroid(item.polygon)

      const el = document.createElement('div')
      el.style.cssText = `width:36px;height:36px;border-radius:50%;border:2.5px solid ${item.dog.territoryColor};overflow:hidden;background:white;box-shadow:0 1px 4px rgba(0,0,0,0.25);flex-shrink:0;`
      const img = document.createElement('img')
      img.src = resolveMarkerImage({
        markerImageType: item.dog.markerImageType,
        markerImageValue: item.dog.markerImageValue,
        markerImageUrl: item.dog.markerImageUrl,
      })
      img.alt = item.dog.name
      const objectFit = item.dog.markerImageType === 'UPLOADED' ? 'cover' : 'contain'
      img.style.cssText = `width:100%;height:100%;object-fit:${objectFit};`
      img.onerror = () => {
        img.src = DEFAULT_MARKER_IMAGE_SRC
      }
      el.appendChild(img)

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
