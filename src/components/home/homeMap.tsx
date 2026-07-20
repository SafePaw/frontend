import { useEffect, useRef, useState, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import { MAPBOX_STYLE_URL } from '../../constants/walk'
import { HOME_MAP_CONFIG } from '../../constants/map'
import pinImg from '../../assets/pin.png'

type GeoPermission = 'granted' | 'denied' | 'prompt' | 'unsupported'

export default function HomeMap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const mapReadyRef = useRef(false)
  const locationMarkerRef = useRef<mapboxgl.Marker | null>(null)
  const pendingCenterRef = useRef<[number, number] | null>(null)
  const mountedRef = useRef(true)

  const [mapError, setMapError] = useState<string | null>(null)
  const [geoPermission, setGeoPermission] = useState<GeoPermission>('prompt')
  const [gpsError, setGpsError] = useState<string | null>(null)

  const applyLocation = useCallback((coords: [number, number]) => {
    if (!mountedRef.current) return
    const map = mapRef.current
    if (!map || !mapReadyRef.current) {
      pendingCenterRef.current = coords
      return
    }

    map.easeTo({ center: coords, zoom: HOME_MAP_CONFIG.userLocationZoom, duration: 600 })

    if (locationMarkerRef.current) {
      locationMarkerRef.current.setLngLat(coords)
    } else {
      const el = document.createElement('img')
      el.src = pinImg
      el.style.cssText = 'width:36px;height:36px;object-fit:contain;display:block;'
      el.alt = '현재 위치'
      const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
      marker.setLngLat(coords).addTo(map)
      locationMarkerRef.current = marker
    }
  }, [])

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
      center: HOME_MAP_CONFIG.defaultCenter,
      zoom: HOME_MAP_CONFIG.defaultZoom,
      attributionControl: false,
    })
    mapRef.current = map

    function handleLoad() {
      if (!mountedRef.current) return
      mapReadyRef.current = true
      if (pendingCenterRef.current) {
        applyLocation(pendingCenterRef.current)
        pendingCenterRef.current = null
      }
    }

    function handleError(e: mapboxgl.ErrorEvent) {
      if (!mountedRef.current) return
      console.error('[SafePaw] 홈 지도 오류:', e.error)
      setMapError('지도를 불러오지 못했습니다.')
    }

    map.on('load', handleLoad)
    map.on('error', handleError)

    const resizeObserver = new ResizeObserver(() => {
      mapRef.current?.resize()
    })
    if (containerRef.current) resizeObserver.observe(containerRef.current)

    return () => {
      mountedRef.current = false
      map.off('load', handleLoad)
      map.off('error', handleError)
      resizeObserver.disconnect()
      locationMarkerRef.current?.remove()
      locationMarkerRef.current = null
      mapReadyRef.current = false
      map.remove()
      mapRef.current = null
    }
  }, [applyLocation])

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoPermission('unsupported')
      return
    }

    navigator.permissions
      ?.query({ name: 'geolocation' })
      .then((result) => {
        if (!mountedRef.current) return
        setGeoPermission(result.state as GeoPermission)

        if (result.state === 'granted') {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              if (!mountedRef.current) return
              applyLocation([pos.coords.longitude, pos.coords.latitude])
            },
            () => {},
            { timeout: 8000, maximumAge: 60000 },
          )
        }
      })
      .catch(() => {})
  }, [applyLocation])

  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) return
    setGpsError(null)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!mountedRef.current) return
        setGeoPermission('granted')
        applyLocation([pos.coords.longitude, pos.coords.latitude])
      },
      (err) => {
        if (!mountedRef.current) return
        if (err.code === err.PERMISSION_DENIED) {
          setGeoPermission('denied')
          setGpsError('위치 권한이 거부됐습니다. 기기 설정에서 허용해 주세요.')
        } else if (err.code === err.TIMEOUT) {
          setGpsError('위치 확인 시간이 초과됐습니다. 다시 시도해 주세요.')
        } else {
          setGpsError('현재 위치를 가져오지 못했습니다.')
        }
      },
      { timeout: 10000, enableHighAccuracy: true },
    )
  }, [applyLocation])

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

      {geoPermission !== 'unsupported' && (
        <button
          onClick={handleLocateMe}
          aria-label="현재 위치로 이동"
          className="absolute bottom-4 right-4 w-11 h-11 rounded-full shadow-md flex items-center justify-center bg-white border border-navy-15 active:opacity-70 transition-opacity"
          style={{ minWidth: 44, minHeight: 44 }}
        >
          <img src={pinImg} alt="" className="w-5 h-5 object-contain" aria-hidden="true" />
        </button>
      )}

      {gpsError && (
        <div className="absolute bottom-20 left-4 right-4 bg-white rounded-xl px-4 py-3 shadow-md">
          <p className="text-f12 text-navy-40 text-center">{gpsError}</p>
        </div>
      )}
    </div>
  )
}
