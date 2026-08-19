import { useState, useRef, type ChangeEvent } from 'react'
import cameraImg from '../../assets/camera.png'
import { updateCrew, getCrewImageUploadUrl, uploadCrewImageToPresignedUrl } from '../../api/crews'
import { extractErrorCode } from '../../utils/apiError'
import { TERRITORY_COLORS } from '../../constants/territoryColors'
import type { CrewResponse, CrewImageUploadRequest } from '../../types/crew'

const ERROR_MESSAGES: Record<string, string> = {
  CREW_NAME_DUPLICATED: '이미 사용 중인 크루 이름이에요.',
  CREW_NOT_LEADER: '크루 리더만 수정할 수 있습니다.',
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
type AllowedMime = (typeof ALLOWED_MIME_TYPES)[number]
function isAllowedMime(type: string): type is AllowedMime {
  return (ALLOWED_MIME_TYPES as readonly string[]).includes(type)
}

interface Props {
  crew: CrewResponse
  onClose: () => void
  onSuccess: (crew: CrewResponse) => void
}

export default function CrewEditModal({ crew, onClose, onSuccess }: Props) {
  const [name, setName] = useState(crew.name)
  const [territoryColor, setTerritoryColor] = useState(crew.territoryColor)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(crew.imageUrl)
  const [imageStorageKey, setImageStorageKey] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const trimmedName = name.trim()
  const isNameValid = trimmedName.length >= 2 && trimmedName.length <= 20
  const canSubmit = isNameValid && !isUploading && !isSaving

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!isAllowedMime(file.type)) {
      setUploadError('jpeg, png, webp 형식의 이미지만 업로드할 수 있어요.')
      return
    }
    setUploadError(null)
    setImageStorageKey(null)
    setImagePreviewUrl(URL.createObjectURL(file))
    setIsUploading(true)
    try {
      const req: CrewImageUploadRequest = { contentType: file.type }
      const { uploadUrl, storageKey } = await getCrewImageUploadUrl(req)
      await uploadCrewImageToPresignedUrl(uploadUrl, file, file.type)
      setImageStorageKey(storageKey)
    } catch {
      setUploadError('이미지 업로드에 실패했어요. 다시 시도해 주세요.')
      setImagePreviewUrl(crew.imageUrl)
    } finally {
      setIsUploading(false)
    }
  }

  async function handleSave() {
    if (!canSubmit) return
    setIsSaving(true)
    setError(null)
    try {
      const updated = await updateCrew(crew.id, {
        name: trimmedName,
        territoryColor,
        ...(imageStorageKey ? { imageKey: imageStorageKey } : {}),
      })
      onSuccess(updated)
    } catch (err) {
      const code = extractErrorCode(err)
      setError(ERROR_MESSAGES[code] ?? '크루 수정에 실패했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget && !isSaving) onClose() }}
    >
      <div className="w-full max-w-md bg-cream rounded-t-2xl px-6 pt-6 pb-10 max-h-[90vh] overflow-y-auto">
        <h2 className="text-f18 font-semibold text-navy mb-5">크루 정보 수정</h2>

        <div className="space-y-5">
          {/* 크루 이미지 */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-24 h-24 rounded-full border-2 border-dashed border-navy-70 bg-navy-5 overflow-hidden flex flex-col items-center justify-center gap-1 active:opacity-70 transition-opacity"
              aria-label="크루 이미지 변경"
            >
              {isUploading ? (
                <div className="w-6 h-6 rounded-full border-2 border-navy-15 border-t-navy animate-spin" />
              ) : imagePreviewUrl ? (
                <img src={imagePreviewUrl} alt="크루 이미지" className="w-full h-full object-cover" onError={() => setImagePreviewUrl(null)} />
              ) : (
                <>
                  <img src={cameraImg} alt="" className="w-6 h-6 object-contain" />
                  <span className="text-f12 text-navy-70">사진 변경</span>
                </>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={handleFileChange}
            />
          </div>
          {uploadError && <p className="text-f12 text-err text-center -mt-2">{uploadError}</p>}

          {/* 크루 이름 */}
          <div>
            <label className="block text-f12 font-medium text-navy-70 mb-1">
              크루 이름 <span className="text-err">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              className="w-full rounded-md px-4 py-3 bg-navy-5 text-f16 text-navy placeholder:text-navy-70 outline-none focus:ring-2 focus:ring-navy-15"
            />
            <p className={`text-f12 mt-1 ${trimmedName.length > 0 && trimmedName.length < 2 ? 'text-err' : 'text-navy-70'}`}>
              {trimmedName.length}/20
            </p>
          </div>

          {/* 크루 영토 색상 */}
          <div>
            <p className="text-f12 font-medium text-navy-70 mb-3">크루 영토 색상</p>
            <div className="grid grid-cols-4 gap-3">
              {TERRITORY_COLORS.map((color) => {
                const isSelected = territoryColor === color.hex
                return (
                  <button
                    key={color.hex}
                    onClick={() => setTerritoryColor(color.hex)}
                    aria-label={color.label}
                    aria-pressed={isSelected}
                    className={[
                      'aspect-square rounded-lg flex items-center justify-center transition-transform duration-150 active:scale-95',
                      isSelected ? 'ring-4 ring-navy ring-offset-2 ring-offset-cream' : '',
                    ].join(' ')}
                    style={{ backgroundColor: color.hex }}
                  >
                    {isSelected && (
                      <span className="text-white text-f16 font-bold" aria-hidden="true">✓</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {error && <p className="text-f12 text-err">{error}</p>}

          <button
            onClick={handleSave}
            disabled={!canSubmit}
            className="w-full py-4 rounded-pill bg-navy text-cream text-f16 font-medium disabled:opacity-40 active:opacity-70 transition-opacity"
          >
            {isSaving ? '저장 중...' : '저장하기'}
          </button>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="w-full py-3 text-f14 text-navy-70 disabled:opacity-40"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  )
}
