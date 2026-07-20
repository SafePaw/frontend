import { useEffect, useRef, useState, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import { WALK_MAP_IDS, MAPBOX_STYLE_URL } from '../../constants/walk'
import type { GeoJsonPolygon } from '../../types/walk'
import pinImg from '../../assets/pin.png'

const ROUTE_LINE_COLOR_ACTIVE = '#2A3244'
const ROUTE_LINE_COLOR_PAUSED = '#9AA3B2'
const ROUTE_LINE_WIDTH = 5

const EMPTY_LINESTRING = {
  type: 'FeatureCollection' as const,
  features: [] as mapboxgl.GeoJSONFeature[],
}

interface WalkMapProps {
  currentPosition: [number, number] | null
  routeCoords: [number, number][]
  isPaused: boolean
  startPoint?: [number, number]
  completedCoords?: [number, number][]
  territoryPolygon?: GeoJsonPolygon | null
  territoryColor?: string
}

export default function WalkMap({
  currentPosition,
  routeCoords,
  isPaused,
  startPoint,
  completedCoords,
  territoryPolygon,
  territoryColor,
}: WalkMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markerRef = useRef<mapboxgl.Marker | null>(null)
  const [followMode, setFollowMode] = useState<'following' | 'free'>('following')
  const [mapError, setMapError] = useState<string | null>(null)
  const [mapReady, setMapReady] = useState(false)

  const isResultMode = !!completedCoords
  const initialCenterRef = useRef<[number, number]>(currentPosition ?? startPoint ?? [126.978, 37.566])

  // 지도 초기화
  useEffect(() => {
    const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
    if (!token) {
      console.error('[SafePaw] VITE_MAPBOX_ACCESS_TOKEN이 설정되지 않았습니다.')
      setMapError('지도 토큰이 설정되지 않았습니다.')
      return
    }
    if (!containerRef.current || mapRef.current) return

    mapboxgl.accessToken = token

    const center: [number, number] = initialCenterRef.current

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: MAPBOX_STYLE_URL,
      center,
      zoom: 16,
      attributionControl: false,
    })

    mapRef.current = map

    map.on('load', () => {
      map.addSource(WALK_MAP_IDS.routeSource, {
        type: 'geojson',
        data: EMPTY_LINESTRING,
      })
      map.addLayer({
        id: WALK_MAP_IDS.routeLayer,
        type: 'line',
        source: WALK_MAP_IDS.routeSource,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': ROUTE_LINE_COLOR_ACTIVE,
          'line-width': ROUTE_LINE_WIDTH,
          'line-opacity': 0.9,
        },
      })

      map.addSource(WALK_MAP_IDS.startPointSource, {
        type: 'geojson',
        data: EMPTY_LINESTRING,
      })
      map.addLayer({
        id: WALK_MAP_IDS.startPointLayer,
        type: 'circle',
        source: WALK_MAP_IDS.startPointSource,
        paint: {
          'circle-radius': 6,
          'circle-color': '#2A3244',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#F2E6B1',
        },
      })

      map.addSource(WALK_MAP_IDS.territorySource, {
        type: 'geojson',
        data: EMPTY_LINESTRING,
      })
      map.addLayer({
        id: WALK_MAP_IDS.territoryFillLayer,
        type: 'fill',
        source: WALK_MAP_IDS.territorySource,
        paint: { 'fill-color': ['get', 'color'], 'fill-opacity': 0.25 },
      })
      map.addLayer({
        id: WALK_MAP_IDS.territoryOutlineLayer,
        type: 'line',
        source: WALK_MAP_IDS.territorySource,
        paint: { 'line-color': ['get', 'color'], 'line-width': 2 },
      })

      setMapReady(true)
    })

    map.on('error', (e) => {
      console.error('[SafePaw] Mapbox 오류:', e.error)
      setMapError('지도를 불러오지 못했습니다.')
    })

    map.on('dragstart', () => setFollowMode('free'))

    const el = document.createElement('img')
    el.src = pinImg
    el.style.cssText = 'width: 40px; height: 40px; object-fit: contain; display: block;'
    el.alt = '현재 위치'
    const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
    markerRef.current = marker

    return () => {
      marker.remove()
      markerRef.current = null
      map.remove()
      mapRef.current = null
      setMapReady(false)
    }
  }, [])

  useEffect(() => {
    if (!mapReady || !currentPosition) return
    const map = mapRef.current
    const marker = markerRef.current
    if (!map || !marker) return

    marker.setLngLat(currentPosition)
    if (!marker._map) marker.addTo(map)

    if (followMode === 'following') {
      map.easeTo({ center: currentPosition, duration: 800 })
    }
  }, [currentPosition, followMode, mapReady])

  // 경로 갱신
  useEffect(() => {
    if (!mapReady) return
    const map = mapRef.current
    if (!map) return

    const coords = isResultMode ? (completedCoords ?? []) : routeCoords
    const source = map.getSource(WALK_MAP_IDS.routeSource) as mapboxgl.GeoJSONSource | undefined
    if (!source) return

    source.setData({
      type: 'Feature',
      properties: {},
      geometry: { type: 'LineString', coordinates: coords },
    })
  }, [routeCoords, completedCoords, isResultMode, mapReady])

  // 시작점 갱신
  useEffect(() => {
    if (!mapReady || !startPoint) return
    const map = mapRef.current
    if (!map) return

    const source = map.getSource(WALK_MAP_IDS.startPointSource) as
      | mapboxgl.GeoJSONSource
      | undefined
    if (!source) return

    source.setData({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: { type: 'Point', coordinates: startPoint },
        },
      ],
    })
  }, [startPoint, mapReady])

  // 일시정지 시 경로 색상 변경
  useEffect(() => {
    if (!mapReady) return
    const map = mapRef.current
    if (!map) return
    map.setPaintProperty(
      WALK_MAP_IDS.routeLayer,
      'line-color',
      isPaused ? ROUTE_LINE_COLOR_PAUSED : ROUTE_LINE_COLOR_ACTIVE,
    )
    map.setPaintProperty(WALK_MAP_IDS.routeLayer, 'line-opacity', isPaused ? 0.5 : 0.9)
  }, [isPaused, mapReady])

  // 영토 polygon
  useEffect(() => {
    if (!mapReady || !territoryPolygon) return
    const map = mapRef.current
    if (!map) return

    const source = map.getSource(WALK_MAP_IDS.territorySource) as mapboxgl.GeoJSONSource | undefined
    if (!source) return

    source.setData({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { color: territoryColor ?? '#2A3244' },
          geometry: territoryPolygon,
        },
      ],
    })
  }, [territoryPolygon, territoryColor, mapReady])

  // 결과
  useEffect(() => {
    if (!mapReady || !isResultMode) return
    const coords = completedCoords ?? []
    if (coords.length < 2) return
    const map = mapRef.current
    if (!map) return

    const bounds = coords.reduce(
      (b, c) => b.extend(c),
      new mapboxgl.LngLatBounds(coords[0], coords[0]),
    )
    map.fitBounds(bounds, { padding: 48, maxZoom: 17 })
  }, [completedCoords, isResultMode, mapReady])

  const handleFollowMe = useCallback(() => {
    setFollowMode('following')
    if (currentPosition && mapRef.current) {
      mapRef.current.easeTo({ center: currentPosition, zoom: 16, duration: 600 })
    }
  }, [currentPosition])

  if (mapError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-navy-8 rounded-xl">
        <p className="text-f14 text-navy-40 text-center px-4">{mapError}</p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />

      {!isResultMode && (
        <button
          onClick={handleFollowMe}
          aria-label="현재 위치로 이동"
          className={[
            'absolute bottom-4 right-4 w-11 h-11 rounded-full shadow-md',
            'flex items-center justify-center',
            'bg-white border border-navy-15 active:opacity-70 transition-opacity',
            followMode === 'following' ? 'border-navy' : '',
          ].join(' ')}
        >
          <img src={pinImg} alt="현재 위치" className="w-5 h-5 object-contain" />
        </button>
      )}
    </div>
  )
}
