import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { MAPBOX_STYLE_URL } from '../../constants/walk'
import { TERRITORY_MAP_IDS, TERRITORY_MAP_CONFIG } from '../../constants/territory'
import type { TerritoryFeatureProperties } from '../../utils/territoryGeoJson'
import { computePolygonCentroid } from '../../utils/territoryGeoJson'
import type { TerritoryBoundsParams, TerritorySummary } from '../../types/territory'
import { DEFAULT_MARKER_IMAGE_SRC } from '../../utils/markerImage'

type TerritoryFeatureCollection = ReturnType<
  typeof import('../../utils/territoryGeoJson').toTerritoryFeatureCollection
>

const EMPTY_COLLECTION = {
  type: 'FeatureCollection' as const,
  features: [] as TerritoryFeatureCollection['features'],
}

interface TerritoryMapProps {
  featureCollection: TerritoryFeatureCollection
  selectedTerritoryId: number | null
  onSelectTerritory: (id: number | null) => void
  onBoundsChange?: (bounds: TerritoryBoundsParams) => void
  boundsData: [[number, number], [number, number]] | null
  territories?: TerritorySummary[]
}

export default function TerritoryMap({
  featureCollection,
  selectedTerritoryId,
  onSelectTerritory,
  onBoundsChange,
  boundsData,
  territories,
}: TerritoryMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const mountedRef = useRef(true)
  const hasFittedBoundsRef = useRef(false)
  const onSelectRef = useRef(onSelectTerritory)
  const onBoundsRef = useRef<((bounds: TerritoryBoundsParams) => void) | undefined>(onBoundsChange)
  const dogMarkersRef = useRef<mapboxgl.Marker[]>([])
  const [mapReady, setMapReady] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)

  useEffect(() => {
    onSelectRef.current = onSelectTerritory
  }, [onSelectTerritory])

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

      m.addSource(TERRITORY_MAP_IDS.source, {
        type: 'geojson',
        data: EMPTY_COLLECTION,
      })

      m.addLayer({
        id: TERRITORY_MAP_IDS.fillLayer,
        type: 'fill',
        source: TERRITORY_MAP_IDS.source,
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': TERRITORY_MAP_CONFIG.fillOpacityOther,
        },
      })

      m.addLayer({
        id: TERRITORY_MAP_IDS.outlineLayer,
        type: 'line',
        source: TERRITORY_MAP_IDS.source,
        paint: {
          'line-color': ['get', 'color'],
          'line-width': TERRITORY_MAP_CONFIG.lineWidthDefault,
        },
      })

      const initialBounds = m.getBounds()
      if (initialBounds && onBoundsRef.current) {
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
      if (!mountedRef.current || !onBoundsRef.current) return
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
      console.error('[SafePaw] 영토 지도 오류:', e.error)
      setMapError('지도를 불러오지 못했습니다.')
    }

    function handleClick(e: mapboxgl.MapMouseEvent) {
      const features = map.queryRenderedFeatures(e.point, {
        layers: [TERRITORY_MAP_IDS.fillLayer],
      })
      if (features.length > 0) {
        const props = features[0].properties as TerritoryFeatureProperties
        onSelectRef.current(props.territoryId)
      } else {
        onSelectRef.current(null)
      }
    }

    function handleMouseEnter() {
      map.getCanvas().style.cursor = 'pointer'
    }

    function handleMouseLeave() {
      map.getCanvas().style.cursor = ''
    }

    const resizeObserver = new ResizeObserver(() => {
      mapRef.current?.resize()
    })
    if (containerRef.current) resizeObserver.observe(containerRef.current)

    map.on('load', handleLoad)
    map.on('error', handleError)
    map.on('click', handleClick)
    map.on('moveend', handleMoveEnd)
    map.on('mouseenter', TERRITORY_MAP_IDS.fillLayer, handleMouseEnter)
    map.on('mouseleave', TERRITORY_MAP_IDS.fillLayer, handleMouseLeave)

    return () => {
      mountedRef.current = false
      map.off('load', handleLoad)
      map.off('error', handleError)
      map.off('click', handleClick)
      map.off('moveend', handleMoveEnd)
      map.off('mouseenter', TERRITORY_MAP_IDS.fillLayer, handleMouseEnter)
      map.off('mouseleave', TERRITORY_MAP_IDS.fillLayer, handleMouseLeave)
      resizeObserver.disconnect()
      dogMarkersRef.current.forEach((m) => m.remove())
      dogMarkersRef.current = []
      setMapReady(false)
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!mapReady) return
    const map = mapRef.current
    if (!map) return
    const source = map.getSource(TERRITORY_MAP_IDS.source) as mapboxgl.GeoJSONSource | undefined
    if (!source) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    source.setData(featureCollection as any)
  }, [featureCollection, mapReady])

  // 선택 반영
  useEffect(() => {
    if (!mapReady) return
    const map = mapRef.current
    if (!map) return
    const selectedId = selectedTerritoryId ?? -1

    map.setPaintProperty(TERRITORY_MAP_IDS.fillLayer, 'fill-opacity', [
      'case',
      ['==', ['get', 'territoryId'], selectedId],
      TERRITORY_MAP_CONFIG.fillOpacitySelected,
      ['==', ['get', 'isMine'], true],
      TERRITORY_MAP_CONFIG.fillOpacityMine,
      TERRITORY_MAP_CONFIG.fillOpacityOther,
    ])

    map.setPaintProperty(TERRITORY_MAP_IDS.outlineLayer, 'line-width', [
      'case',
      ['==', ['get', 'territoryId'], selectedId],
      TERRITORY_MAP_CONFIG.lineWidthSelected,
      TERRITORY_MAP_CONFIG.lineWidthDefault,
    ])
  }, [selectedTerritoryId, mapReady])

  useEffect(() => {
    if (!mapReady || !boundsData || hasFittedBoundsRef.current) return
    const map = mapRef.current
    if (!map) return

    const [[minLng, minLat], [maxLng, maxLat]] = boundsData
    map.fitBounds(
      [
        [minLng, minLat],
        [maxLng, maxLat],
      ],
      {
        padding: TERRITORY_MAP_CONFIG.fitBoundsPadding,
        maxZoom: TERRITORY_MAP_CONFIG.maxZoomOnFit,
        duration: 800,
      },
    )
    hasFittedBoundsRef.current = true
  }, [mapReady, boundsData])

  useEffect(() => {
    if (!mapReady) return
    const map = mapRef.current
    if (!map || !territories) return

    dogMarkersRef.current.forEach((m) => m.remove())
    dogMarkersRef.current = []

    for (const territory of territories) {
      if (!territory.polygon?.coordinates?.length) continue
      const centroid = computePolygonCentroid(territory.polygon.coordinates)

      const el = document.createElement('div')
      el.style.cssText = `width:36px;height:36px;border-radius:50%;border:2.5px solid ${territory.dog.territoryColor};overflow:hidden;background:white;box-shadow:0 1px 4px rgba(0,0,0,0.25);flex-shrink:0;`
      const img = document.createElement('img')
      img.src = territory.dog.markerImageUrl ?? DEFAULT_MARKER_IMAGE_SRC
      img.alt = territory.dog.name
      img.style.cssText = 'width:100%;height:100%;object-fit:contain;'
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
        <p className="text-f16 text-navy-40 text-center px-6">{mapError}</p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  )
}
