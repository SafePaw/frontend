import { useRef, useState } from 'react'
import Button from '../../ui/button'
import BottomSheet from '../../ui/bottomSheet'

interface Props {
  onDownload: () => void
  onShare: () => void
  onSave: () => void
  onChangePhoto: (file: File) => void
  onResetBackground: () => void
  hasCustomBackground: boolean
  isCaptureDisabled: boolean
  isShareReady: boolean
  hasSaveError: boolean
}

export default function ShareCardActions({
  onDownload,
  onShare,
  onSave,
  onChangePhoto,
  onResetBackground,
  hasCustomBackground,
  isCaptureDisabled,
  isShareReady,
  hasSaveError,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) onChangePhoto(file)
    e.target.value = ''
  }

  function choosePhoto(camera: boolean) {
    const input = camera ? cameraInputRef.current : fileInputRef.current
    input?.click()
    setIsSheetOpen(false)
  }

  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share

  return (
    <div className="pt-6">
      <div className="flex justify-center">
        <Button
          variant="text"
          className="min-h-11 !no-underline"
          disabled={isCaptureDisabled}
          onClick={() => setIsSheetOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={isSheetOpen}
        >
          배경 사진 변경
        </Button>
      </div>
      <div className="mt-6 flex flex-col gap-2">
        {!isShareReady ? (
          <Button
            fullWidth
            className="h-14 !rounded-lg"
            onClick={onSave}
            disabled={isCaptureDisabled}
          >
            {hasSaveError ? '다시 저장하기' : '공유카드 저장하기'}
          </Button>
        ) : (
          <>
            {canNativeShare && (
              <Button
                fullWidth
                className="h-14 !rounded-lg"
                onClick={onShare}
                disabled={isCaptureDisabled}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 16V3m-4 4 4-4 4 4M5 13v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7" />
                </svg>
                공유하기
              </Button>
            )}
            <Button
              fullWidth
              variant={canNativeShare ? 'text' : 'fill'}
              className={canNativeShare ? 'min-h-12 !no-underline' : 'h-14 !rounded-lg'}
              onClick={onDownload}
              disabled={isCaptureDisabled}
            >
              이미지 저장
            </Button>
          </>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
        aria-label="배경 사진 선택"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
        aria-label="배경 사진 촬영"
      />
      {isSheetOpen && (
        <BottomSheet title="배경 사진 변경" onClose={() => setIsSheetOpen(false)}>
          <div className="flex flex-col divide-y divide-navy-8">
            <button
              type="button"
              className="min-h-14 text-left font-medium"
              onClick={() => choosePhoto(false)}
            >
              앨범에서 선택
            </button>
            <button
              type="button"
              className="min-h-14 text-left font-medium"
              onClick={() => choosePhoto(true)}
            >
              사진 촬영
            </button>
            <button
              type="button"
              className="min-h-14 text-left text-navy-70 disabled:opacity-40"
              disabled={!hasCustomBackground}
              onClick={() => {
                onResetBackground()
                setIsSheetOpen(false)
              }}
            >
              ↻ 기본 배경으로 되돌리기
            </button>
          </div>
        </BottomSheet>
      )}
    </div>
  )
}
