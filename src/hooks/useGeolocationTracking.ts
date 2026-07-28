import { useCallback, useEffect, useRef, useState } from 'react'
import type { WalkPointDto } from '../types/walk'

export type LocationErrorCode =
  | 'PERMISSION_DENIED'
  | 'POSITION_UNAVAILABLE'
  | 'TIMEOUT'
  | 'LOW_ACCURACY'

export interface LocationError extends Error {
  code: LocationErrorCode
  accuracyMeters?: number
}

interface UseGeolocationTrackingOptions {
  onPoint?: (point: WalkPointDto) => void
  onError?: (message: string) => void
}

function createLocationError(
  code: LocationErrorCode,
  message: string,
  accuracyMeters?: number,
): LocationError {
  return Object.assign(new Error(message), { code, accuracyMeters }) as LocationError
}

function locationErrorFromGeo(err: GeolocationPositionError): LocationError {
  switch (err.code) {
    case err.PERMISSION_DENIED:
      return createLocationError(
        'PERMISSION_DENIED',
        '위치 권한이 차단되어 있습니다. 브라우저 설정에서 위치 권한을 허용한 뒤 다시 시도해 주세요.',
      )
    case err.POSITION_UNAVAILABLE:
      return createLocationError(
        'POSITION_UNAVAILABLE',
        '현재 위치를 가져올 수 없습니다. 기기의 위치 서비스와 네트워크 상태를 확인해 주세요.',
      )
    case err.TIMEOUT:
      return createLocationError(
        'TIMEOUT',
        '위치 확인 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.',
      )
    default:
      return createLocationError('POSITION_UNAVAILABLE', 'GPS 오류가 발생했습니다.')
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
      reject(createLocationError('POSITION_UNAVAILABLE', '이 브라우저는 GPS를 지원하지 않습니다.'))
      return
    }

    let settled = false
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true
        reject(
          createLocationError(
            'TIMEOUT',
            `${timeoutMs / 1000}초 내에 GPS 신호를 받지 못했습니다.`,
          ),
        )
      }
    }, timeoutMs)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timer)
        if (settled) return
        settled = true
        if (pos.coords.accuracy > accuracyThresholdMeters) {
          reject(
            createLocationError(
              'LOW_ACCURACY',
              `현재 위치 정확도가 낮습니다 (약 ${Math.round(pos.coords.accuracy)}m). 실외나 창가에서 잠시 기다린 뒤 다시 시도해 주세요.`,
              pos.coords.accuracy,
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
        reject(locationErrorFromGeo(err))
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
        const locErr = locationErrorFromGeo(err)
        setGeoError(locErr.message)
        optionsRef.current.onError?.(locErr.message)
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
