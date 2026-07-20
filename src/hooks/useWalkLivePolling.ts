import { useEffect, useRef } from 'react'
import { getWalkLive } from '../api/walks'
import { useWalkStore } from '../stores/walkStore'
import { WALK_GPS_CONFIG } from '../constants/walk'

export function useWalkLivePolling(walkId: number | null) {
  const setLiveStats = useWalkStore((s) => s.setLiveStats)
  const setError = useWalkStore((s) => s.setError)

  const inFlightRef = useRef(false)
  const failCountRef = useRef(0)

  useEffect(() => {
    if (!walkId) return

    const tick = async () => {
      if (inFlightRef.current) return
      inFlightRef.current = true
      try {
        const stats = await getWalkLive(walkId)
        setLiveStats(stats)
        failCountRef.current = 0
        setError(null)
      } catch {
        failCountRef.current += 1
        if (failCountRef.current >= WALK_GPS_CONFIG.livePollingFailThreshold) {
          setError({ code: 'LIVE_POLL_FAIL', message: '실시간 통계를 불러오지 못하고 있습니다.' })
        }
      } finally {
        inFlightRef.current = false
      }
    }

    tick()
    const id = setInterval(tick, WALK_GPS_CONFIG.livePollingIntervalMs)

    return () => {
      clearInterval(id)
      inFlightRef.current = false
      failCountRef.current = 0
    }
  }, [walkId, setLiveStats, setError])
}
