import { useRef, useState } from 'react'
import {
  getShareCard,
  getShareCardUploadUrl,
  saveShareCard,
  uploadShareCardImageToPresignedUrl,
} from '../api/walks'
import { extractErrorCode, extractErrorMessage } from '../utils/apiError'
import type { ShareCardResponse } from '../types/walk'

export function useWalkShareCard(walkId: number) {
  const draft = useRef<{
    backgroundKey: string | null
    renderedKey: string | null
    rendered: Blob | null
    metadataSaved: boolean
  }>({ backgroundKey: null, renderedKey: null, rendered: null, metadataSaved: false })
  const busy = useRef(false)
  const [stage, setStage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [savedCard, setSavedCard] = useState<ShareCardResponse | null>(null)
  const [renderedFile, setRenderedFile] = useState<File | null>(null)

  function resetDraft() {
    if (busy.current) return
    draft.current = { backgroundKey: null, renderedKey: null, rendered: null, metadataSaved: false }
    setSavedCard(null)
    setRenderedFile(null)
    setError(null)
  }

  async function save(background: File | null, capture: () => Promise<Blob>) {
    if (busy.current) return
    busy.current = true
    setError(null)
    let currentStage = '공유 이미지 만들기'
    const progress = (value: string) => {
      currentStage = value
      setStage(value)
    }
    try {
      const pending = draft.current
      progress(currentStage)
      pending.rendered ??= await capture()

      if (background && !pending.backgroundKey) {
        progress('배경 이미지 업로드 URL 발급')
        const upload = await getShareCardUploadUrl(walkId, 'BACKGROUND', background.type)
        progress('배경 이미지 업로드')
        await uploadShareCardImageToPresignedUrl(upload.uploadUrl, background)
        pending.backgroundKey = upload.imageKey
      }
      if (!pending.renderedKey) {
        progress('완성 이미지 업로드 URL 발급')
        const upload = await getShareCardUploadUrl(walkId, 'RENDERED', pending.rendered.type)
        progress('완성 이미지 업로드')
        await uploadShareCardImageToPresignedUrl(upload.uploadUrl, pending.rendered)
        pending.renderedKey = upload.imageKey
      }
      if (!pending.metadataSaved) {
        progress('공유카드 저장')
        await saveShareCard(walkId, {
          backgroundImageKey: pending.backgroundKey,
          renderedImageKey: pending.renderedKey,
        })
        pending.metadataSaved = true
      }
      progress('저장된 공유카드 조회')
      const card = await getShareCard(walkId)
      if (!card.renderedImageUrl) throw new Error('완성 이미지 주소가 없습니다.')
      setSavedCard(card)
      setRenderedFile(
        new File([pending.rendered], `safepaw-walk-${walkId}.png`, { type: 'image/png' }),
      )
    } catch (err) {
      const message =
        extractErrorCode(err) === 'WALK_NOT_COMPLETED'
          ? '완료된 산책에만 공유카드를 만들 수 있습니다.'
          : `${currentStage}에 실패했습니다. ${extractErrorMessage(err)}`
      setError(message)
    } finally {
      busy.current = false
      setStage(null)
    }
  }

  return { stage, error, savedCard, renderedFile, resetDraft, save }
}
