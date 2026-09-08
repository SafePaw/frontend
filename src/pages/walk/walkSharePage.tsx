import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { useNavigate, useParams } from 'react-router-dom'
import { getShareCard, getWalkSummary } from '../../api/walks'
import { ROUTES } from '../../constants/routes'
import WalkShareCard from '../../components/walk/share/walkShareCard'
import Toast from '../../components/ui/toast'
import ShareCardActions from '../../components/walk/share/shareCardActions'
import { useWalkShareCard } from '../../hooks/useWalkShareCard'
import { extractErrorCode, extractErrorMessage } from '../../utils/apiError'
import { resolveMarkerImage } from '../../utils/markerImage'
import { captureWalkShareCard } from '../../utils/walkShareCapture'
import type { ShareCardResponse, WalkShareData } from '../../types/walk'

export default function WalkSharePage() {
  const { walkId } = useParams<{ walkId: string }>()
  return <WalkShareEditor key={walkId} walkId={Number(walkId)} />
}

function WalkShareEditor({ walkId }: { walkId: number }) {
  const navigate = useNavigate()
  const [shareData, setShareData] = useState<WalkShareData | null>(null)
  const [existingCard, setExistingCard] = useState<ShareCardResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loadAttempt, setLoadAttempt] = useState(0)
  const [background, setBackground] = useState<File | null>(null)
  const [bgObjectUrl, setBgObjectUrl] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [isSharing, setIsSharing] = useState(false)
  const actionBusy = useRef(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [animationTriggered, setAnimationTriggered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const captureRef = useRef<HTMLDivElement>(null)
  const { stage, error, savedCard, renderedFile, resetDraft, save } = useWalkShareCard(walkId)
  const card = savedCard ?? existingCard
  const isBusy = stage !== null || isDownloading || isSharing
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setLoadError(null)
    async function load() {
      try {
        if (!Number.isSafeInteger(walkId) || walkId <= 0)
          throw new Error('올바르지 않은 산책 주소입니다.')
        const summary = await getWalkSummary(walkId)
        if (summary.status !== 'COMPLETED')
          throw new Error('완료된 산책에만 공유카드를 만들 수 있습니다.')
        const stored = await getShareCard(walkId).catch((err: unknown) => {
          if (extractErrorCode(err) === 'SHARE_CARD_NOT_FOUND') return null
          throw err
        })
        if (cancelled) return
        setShareData({
          distanceMeters: summary.stats.distanceMeters,
          durationSeconds: summary.stats.durationSeconds,
          averageSpeedKmh: summary.stats.averageSpeedKmh,
          caloriesKcal: summary.stats.caloriesKcal ?? null,
          territory: summary.territory,
          route: summary.polyline?.coordinates ?? null,
          dogName: summary.owner.dog.name,
          markerImageUrl: resolveMarkerImage(summary.owner.dog),
          territoryColor: summary.owner.dog.territoryColor,
        })
        setExistingCard(stored)
      } catch (err) {
        if (!cancelled) setLoadError(extractErrorMessage(err))
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [walkId, loadAttempt])

  useEffect(() => {
    if (!shareData) return
    const timer = setTimeout(() => setAnimationTriggered(true), 50)
    return () => clearTimeout(timer)
  }, [shareData])

  useEffect(() => {
    if (!background) {
      setBgObjectUrl(null)
      return
    }
    const url = URL.createObjectURL(background)
    setBgObjectUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [background])

  function handleChangePhoto(file: File) {
    if (isBusy) return
    setPhotoError(null)
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      setPhotoError(
        'JPG, PNG, WebP 또는 GIF 사진을 선택해 주세요. HEIC 사진은 JPG로 변환해 주세요.',
      )
      return
    }
    resetDraft()
    setExistingCard(null)
    setActionError(null)
    setBackground(file)
  }

  function handleResetBackground() {
    if (isBusy) return
    resetDraft()
    setExistingCard(null)
    setBackground(null)
    setBgObjectUrl(null)
    setPhotoError(null)
    setActionError(null)
  }

  async function handleSave() {
    if (isBusy || actionBusy.current) return
    setActionError(null)
    await save(background, async () => {
      flushSync(() => setIsCapturing(true))
      try {
        if (!captureRef.current) throw new Error('공유카드가 아직 준비되지 않았습니다.')
        return await captureWalkShareCard(captureRef.current)
      } finally {
        setIsCapturing(false)
      }
    })
  }

  async function handleShare() {
    if (!card?.renderedImageUrl || isBusy || actionBusy.current) return
    actionBusy.current = true
    setIsSharing(true)
    setActionError(null)
    try {
      if (renderedFile && navigator.canShare?.({ files: [renderedFile] })) {
        await navigator.share({ files: [renderedFile], title: 'SafePaw 산책 기록' })
      } else {
        await navigator.share({ url: card.renderedImageUrl, title: 'SafePaw 산책 기록' })
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      setActionError('공유하지 못했습니다. 다시 시도하거나 이미지 저장을 이용해 주세요.')
    } finally {
      actionBusy.current = false
      setIsSharing(false)
    }
  }

  async function handleDownload() {
    if (!card?.renderedImageUrl || isBusy || actionBusy.current) return
    actionBusy.current = true
    setIsDownloading(true)
    setActionError(null)
    let url: string | null = null
    try {
      let image: Blob | null = renderedFile
      if (!image) {
        const res = await fetch(card.renderedImageUrl, { credentials: 'omit' })
        if (!res.ok) throw new Error('이미지를 불러오지 못했습니다.')
        image = await res.blob()
      }
      url = URL.createObjectURL(image)
      const a = document.createElement('a')
      a.download = `safepaw-walk-${walkId}.png`
      a.href = url
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch {
      setActionError('이미지를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      if (url) {
        const downloadUrl = url
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000)
      }
      actionBusy.current = false
      setIsDownloading(false)
    }
  }

  if (isLoading)
    return (
      <div role="status" className="p-6 text-navy">
        산책 정보를 불러오는 중...
      </div>
    )
  if (loadError)
    return (
      <div className="p-6 space-y-4 text-navy">
        <p role="alert">{loadError}</p>
        <button onClick={() => setLoadAttempt((value) => value + 1)}>다시 불러오기</button>
        <button className="block" onClick={() => navigate(ROUTES.HOME)}>
          홈으로
        </button>
      </div>
    )

  return (
    <div className="h-full min-h-0 bg-surface overflow-y-auto">
      <header
        className="grid grid-cols-[44px_1fr_44px] items-center px-5 pb-6"
        style={{ paddingTop: 'calc(16px + env(safe-area-inset-top))' }}
      >
        <button
          onClick={() => navigate(-1)}
          aria-label="뒤로 가기"
          className="h-11 w-11 text-f24 text-navy"
        >
          ‹
        </button>
        <h1 className="text-center text-f20 font-semibold text-navy">공유 카드</h1>
      </header>
      <main className="px-6" style={{ paddingBottom: 'calc(16px + env(safe-area-inset-bottom))' }}>
        {shareData && (
          <>
            <div className="rounded-xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04),0_12px_32px_rgba(0,0,0,0.08)]">
              {card?.renderedImageUrl ? (
                <img
                  src={card.renderedImageUrl}
                  alt="저장된 산책 공유카드"
                  className="w-full aspect-[4/5] object-contain rounded-xl"
                />
              ) : (
                <WalkShareCard
                  cardRef={cardRef}
                  data={shareData}
                  bgObjectUrl={bgObjectUrl ?? card?.backgroundImageUrl ?? null}
                  animationTriggered={animationTriggered}
                  reducedMotion={reducedMotion}
                />
              )}
            </div>
            {/* Capture a fully visible, static card without interrupting preview animations. */}
            {isCapturing && (
              <div
                aria-hidden="true"
                className="fixed pointer-events-none"
                style={{ left: -10000, top: 0, width: 360 }}
              >
                <WalkShareCard
                  cardRef={captureRef}
                  data={shareData}
                  bgObjectUrl={bgObjectUrl ?? card?.backgroundImageUrl ?? null}
                  animationTriggered
                  reducedMotion
                  markerClipId="walk-share-capture-marker"
                />
              </div>
            )}
            {(stage || isDownloading || isSharing) && (
              <p
                role="status"
                className="flex items-center justify-center gap-2 pt-4 text-f14 text-navy-70"
              >
                <span
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 rounded-full border-2 border-navy-15 border-t-navy animate-spin"
                />
                {isSharing ? '공유중' : '사진 저장중'}
              </p>
            )}
            {(error || photoError || actionError) && (
              <Toast role="alert" visible message={error || photoError || actionError || ''} />
            )}
            <ShareCardActions
              onSave={handleSave}
              hasSaveError={!!error}
              onDownload={handleDownload}
              onShare={handleShare}
              onChangePhoto={handleChangePhoto}
              onResetBackground={handleResetBackground}
              hasCustomBackground={!!(bgObjectUrl ?? card?.backgroundImageUrl)}
              isCaptureDisabled={isBusy}
              isShareReady={!!card?.renderedImageUrl}
            />
          </>
        )}
      </main>
    </div>
  )
}
