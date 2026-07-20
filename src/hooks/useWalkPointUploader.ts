import { useCallback, useEffect, useRef, useState } from 'react'
import { uploadPoints } from '../api/walks'
import { WALK_GPS_CONFIG } from '../constants/walk'
import type { WalkPointDto } from '../types/walk'

interface UseWalkPointUploaderOptions {
  walkId: number | null
  isActive: boolean
}

export function useWalkPointUploader({ walkId, isActive }: UseWalkPointUploaderOptions) {
  const queueRef = useRef<WalkPointDto[]>([])
  const isUploadingRef = useRef(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [queueWarning, setQueueWarning] = useState(false)

  const syncCount = useCallback(() => {
    const count = queueRef.current.length
    setPendingCount(count)
    setQueueWarning(count >= WALK_GPS_CONFIG.maxPendingPointCount)
  }, [])

  // 새 GPS 포인트 추가
  const addPoint = useCallback(
    (point: WalkPointDto) => {
      if (!isActive) return
      if (queueRef.current.length >= WALK_GPS_CONFIG.maxPendingPointCount) {
        queueRef.current.shift()
      }
      queueRef.current.push(point)
      syncCount()
    },
    [isActive, syncCount],
  )

  // 60개씩 전송
  const uploadChunk = useCallback(async (): Promise<void> => {
    if (!walkId || isUploadingRef.current || queueRef.current.length === 0) return

    const chunk = queueRef.current.slice(0, WALK_GPS_CONFIG.pointBatchSize)
    const idempotencyKey = crypto.randomUUID()
    isUploadingRef.current = true
    try {
      await uploadPoints(walkId, chunk, idempotencyKey)
      queueRef.current = queueRef.current.slice(chunk.length)
      syncCount()
    } catch {
      // 실패 시 queue 유지 — 다음에 재전송
    } finally {
      isUploadingRef.current = false
    }
  }, [walkId, syncCount])

  // 중지 직전 또는 수동 flush
  const flush = useCallback(async (): Promise<void> => {
    if (!walkId || queueRef.current.length === 0) return
    await uploadChunk()
  }, [walkId, uploadChunk])

  // 종료를 위한 현재 스냅샷
  const getPendingSnapshot = useCallback((): WalkPointDto[] => {
    return [...queueRef.current]
  }, [])

  // 종료 후 비우기
  const clearQueue = useCallback(() => {
    queueRef.current = []
    syncCount()
  }, [syncCount])

  useEffect(() => {
    if (!isActive || !walkId) return

    const id = setInterval(() => {
      uploadChunk()
    }, WALK_GPS_CONFIG.pointUploadIntervalMs)

    return () => clearInterval(id)
  }, [isActive, walkId, uploadChunk])

  return { addPoint, flush, getPendingSnapshot, clearQueue, pendingCount, queueWarning }
}
