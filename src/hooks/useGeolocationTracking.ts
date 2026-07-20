import { useCallback, useEffect, useRef, useState } from 'react'
import type { WalkPointDto } from '../types/walk'

interface UseGeolocationTrackingOptions {
  onPoint?: (point: WalkPointDto) => void
  onError?: (message: string) => void
}

function formatGeoError(err: GeolocationPositionError): string {
  switch (err.code) {
    case err.PERMISSION_DENIED:
      return '위치 권한이 거부됐습니다. 브라우저 설정에서 위치 권한을 허용해 주세요.'
    case err.POSITION_UNAVAILABLE:
      return 'GPS 신호를 찾을 수 없습니다.'
    case err.TIMEOUT:
      return 'GPS 신호 수신 시간이 초과됐습니다.'
    default:
      return 'GPS 오류가 발생했습니다.'
  }
}

function positionToDto(pos: GeolocationPosition): WalkPointDto {
  return {
    lng: pos.coords.longitude,
    lat: pos.coords.latitude,
    accuracyMeters: pos.coords.accuracy,
    speedKmh: pos.coords.speed != null ? pos.coords.speed * 3.6 : undefined,
    recordedAt: new Date(pos.timestamp).toISOString(),
  }
}

export function getInitialPosition(
  accuracyThresholdMeters: number,
  timeoutMs: number,
): Promise<WalkPointDto> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('이 브라우저는 GPS를 지원하지 않습니다.'))
      return
    }

    let settled = false
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true
        reject(new Error(`${timeoutMs / 1000}초 내에 GPS 신호를 받지 못했습니다.`))
      }
    }, timeoutMs)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timer)
        if (settled) return
        settled = true
        if (pos.coords.accuracy > accuracyThresholdMeters) {
          reject(
            new Error(
              `GPS 정확도가 낮습니다 (현재 약 ${Math.round(pos.coords.accuracy)}m). 실외로 이동 후 다시 시도해 주세요.`,
            ),
          )
          return
        }
        resolve(positionToDto(pos))
      },
      (err) => {
        clearTimeout(timer)
        if (settled) return
        settled = true
        reject(new Error(formatGeoError(err)))
      },
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 0 },
    )
  })
}

export function useGeolocationTracking(options: UseGeolocationTrackingOptions = {}) {
  const optionsRef = useRef(options)
  optionsRef.current = options

  const watchIdRef = useRef<number | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)

  const startTracking = useCallback(() => {
    if (watchIdRef.current !== null) return
    if (!navigator.geolocation) {
      setGeoError('이 브라우저는 GPS를 지원하지 않습니다.')
      return
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setGeoError(null)
        optionsRef.current.onPoint?.(positionToDto(pos))
      },
      (err) => {
        const msg = formatGeoError(err)
        setGeoError(msg)
        optionsRef.current.onError?.(msg)
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 5_000 },
    )
    setIsTracking(true)
  }, [])

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setIsTracking(false)
  }, [])

  useEffect(() => () => stopTracking(), [stopTracking])

  return { isTracking, geoError, startTracking, stopTracking }
}
