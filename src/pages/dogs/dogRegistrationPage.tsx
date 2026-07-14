import { useState, useRef, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/button'
import { ROUTES } from '../../constants/routes'
import { DOG_BREEDS, type DogBreedOption } from '../../constants/dogBreeds'
import {
  DOG_MARKER_PRESETS,
  DEFAULT_PRESET_ID,
  type DogMarkerPreset,
} from '../../constants/dogMarkers'
import { TERRITORY_COLORS, DEFAULT_TERRITORY_COLOR_HEX } from '../../constants/territoryColors'
import { createDog, getDogMarkerUploadUrl, uploadDogMarkerToPresignedUrl } from '../../api/dogs'
import type { DogGender, CreateDogRequest } from '../../types/dog'

const PRESETS_PER_PAGE = 9
const presetPages: DogMarkerPreset[][] = []
for (let i = 0; i < DOG_MARKER_PRESETS.length; i += PRESETS_PER_PAGE) {
  presetPages.push(DOG_MARKER_PRESETS.slice(i, i + PRESETS_PER_PAGE))
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
type AllowedMime = (typeof ALLOWED_MIME_TYPES)[number]
function isAllowedMime(type: string): type is AllowedMime {
  return (ALLOWED_MIME_TYPES as readonly string[]).includes(type)
}

export default function DogRegistrationPage() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [gender, setGender] = useState<DogGender | null>(null)
  const [selectedBreed, setSelectedBreed] = useState<DogBreedOption | null>(null)
  const [customBreed, setCustomBreed] = useState('')
  const [isBreedPickerOpen, setIsBreedPickerOpen] = useState(false)
  const [age, setAge] = useState('')
  const [weightKg, setWeightKg] = useState('')
  const [territoryColor, setTerritoryColor] = useState(DEFAULT_TERRITORY_COLOR_HEX)

  const [markerMode, setMarkerMode] = useState<'preset' | 'upload'>('preset')
  const [selectedPresetId, setSelectedPresetId] = useState<string>(DEFAULT_PRESET_ID)
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string | null>(null)
  const [markerStorageKey, setMarkerStorageKey] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false)
  const [isPresetPickerOpen, setIsPresetPickerOpen] = useState(false)
  const [presetPage, setPresetPage] = useState(0)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const finalBreed =
    selectedBreed?.name_en === 'Other' ? customBreed.trim() : (selectedBreed?.name_ko ?? '')

  const breedDisplayText = (() => {
    if (!selectedBreed) return null
    return selectedBreed.name_en === 'Other' && customBreed.trim()
      ? customBreed.trim()
      : selectedBreed.name_ko
  })()

  const currentMarkerSrc =
    markerMode === 'preset'
      ? (DOG_MARKER_PRESETS.find((p) => p.id === selectedPresetId)?.imageSrc ?? null)
      : uploadPreviewUrl

  const isUploadReady =
    markerMode === 'preset' || (markerMode === 'upload' && markerStorageKey !== null)

  const isValid =
    name.trim().length > 0 && gender !== null && !isUploading && isUploadReady && !isSubmitting

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!isAllowedMime(file.type)) {
      setUploadError('jpeg, png, webp 형식의 이미지만 업로드할 수 있어요.')
      return
    }
    setUploadError(null)
    setMarkerStorageKey(null)
    setUploadPreviewUrl(URL.createObjectURL(file))
    setIsUploading(true)
    try {
      const { uploadUrl, storageKey } = await getDogMarkerUploadUrl({ contentType: file.type })
      await uploadDogMarkerToPresignedUrl(uploadUrl, file, file.type)
      setMarkerStorageKey(storageKey)
    } catch {
      setUploadError('이미지 업로드에 실패했어요. 다시 시도해 주세요.')
      setUploadPreviewUrl(null)
    } finally {
      setIsUploading(false)
    }
  }

  function handleSelectPreset() {
    setIsActionSheetOpen(false)
    setIsPresetPickerOpen(true)
  }

  function handleSelectUpload() {
    setMarkerMode('upload')
    setIsActionSheetOpen(false)
    setTimeout(() => fileInputRef.current?.click(), 50)
  }

  function handlePresetSelect(id: string) {
    setSelectedPresetId(id)
    setMarkerMode('preset')
    setMarkerStorageKey(null)
    setUploadPreviewUrl(null)
    setUploadError(null)
    setIsPresetPickerOpen(false)
  }

  async function handleSubmit() {
    if (!isValid || !gender) return
    setSubmitError(null)
    setIsSubmitting(true)
    try {
      const ageNum = age ? parseInt(age, 10) : undefined
      const weightNum = weightKg ? parseFloat(weightKg) : undefined
      const markerImageType = markerMode === 'upload' && markerStorageKey ? 'UPLOADED' : 'PRESET'
      const markerImageValue =
        markerMode === 'upload' && markerStorageKey ? markerStorageKey : selectedPresetId

      const body: CreateDogRequest = {
        name: name.trim(),
        gender,
        ...(finalBreed ? { breed: finalBreed } : {}),
        ...(ageNum !== undefined && !isNaN(ageNum) ? { age: ageNum } : {}),
        ...(weightNum !== undefined && !isNaN(weightNum) ? { weightKg: weightNum } : {}),
        markerImageType,
        markerImageValue,
        territoryColor,
      }
      await createDog(body)
      navigate(ROUTES.DOGS.INDEX, { replace: true })
    } catch {
      setSubmitError('강아지 등록에 실패했어요. 다시 시도해 주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative flex flex-col h-full bg-cream">
      <div className="flex items-center px-6 pt-14 pb-6">
        <button
          onClick={() => navigate(-1)}
          className="mr-3 text-f20 text-navy-70 leading-none"
          aria-label="뒤로가기"
        >
          ←
        </button>
        <h1 className="text-f20 font-semibold text-navy">강아지 등록</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">
        {/* 마커  */}
        <div className="flex justify-center pt-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsActionSheetOpen(true)}
              className="w-28 h-28 rounded-full border-2 border-dashed border-navy-40 bg-navy-5 overflow-hidden flex flex-col items-center justify-center gap-1 active:opacity-70 transition-opacity"
              aria-label="마커 이미지 선택"
            >
              {isUploading ? (
                <div className="w-6 h-6 rounded-full border-2 border-navy-15 border-t-navy animate-spin" />
              ) : currentMarkerSrc ? (
                <img
                  src={currentMarkerSrc}
                  alt="선택된 마커"
                  className="w-full h-full object-cover"
                />
              ) : markerStorageKey ? (
                <span className="text-f12 text-navy-40 text-center leading-tight px-2">
                  업로드
                  <br />
                  완료 ✓
                </span>
              ) : (
                <>
                  <span className="text-2xl" aria-hidden="true">
                    📷
                  </span>
                  <span className="text-f12 text-navy-40">사진 추가</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsActionSheetOpen(true)}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-navy flex items-center justify-center shadow-md"
              aria-label="마커 이미지 변경"
            >
              <span className="text-cream text-f16 font-medium leading-none">+</span>
            </button>
          </div>
        </div>

        {uploadError && markerMode === 'upload' && (
          <p className="text-f12 text-err text-center -mt-2">{uploadError}</p>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={handleFileChange}
        />

        {/* 이름 */}
        <div>
          <label className="block text-f12 font-medium text-navy-70 mb-1">
            이름 <span className="text-err">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="강아지 이름"
            className="w-full rounded-md px-4 py-3 bg-navy-5 text-f16 text-navy placeholder:text-navy-40 outline-none focus:ring-2 focus:ring-navy-15"
          />
        </div>

        {/* 견종 */}
        <div>
          <label className="block text-f12 font-medium text-navy-70 mb-1">견종</label>
          <button
            type="button"
            onClick={() => setIsBreedPickerOpen(true)}
            className="w-full rounded-md px-4 py-3 bg-navy-5 text-f16 text-left flex items-center justify-between active:opacity-70 transition-opacity"
          >
            {breedDisplayText ? (
              <span className="text-navy">{breedDisplayText}</span>
            ) : (
              <span className="text-navy-40">견종 선택</span>
            )}
            <span className="text-navy-40 text-f12">▾</span>
          </button>
          {selectedBreed?.name_en === 'Other' && (
            <input
              type="text"
              value={customBreed}
              onChange={(e) => setCustomBreed(e.target.value)}
              placeholder="견종을 직접 입력해주세요"
              className="mt-2 w-full rounded-md px-4 py-3 bg-navy-5 text-f16 text-navy placeholder:text-navy-40 outline-none focus:ring-2 focus:ring-navy-15"
            />
          )}
        </div>

        {/* 성별 */}
        <div>
          <p className="text-f12 font-medium text-navy-70 mb-2">
            성별 <span className="text-err">*</span>
          </p>
          <div className="flex gap-3">
            {(['MALE', 'FEMALE'] as const).map((value) => (
              <button
                key={value}
                onClick={() => setGender(value)}
                aria-pressed={gender === value}
                className={[
                  'flex-1 py-3 rounded-md text-f16 font-medium transition-colors',
                  gender === value ? 'bg-navy text-cream' : 'bg-navy-8 text-navy',
                ].join(' ')}
              >
                {value === 'MALE' ? '수컷' : '암컷'}
              </button>
            ))}
          </div>
        </div>

        {/* 나이 / 몸무게 */}
        <div>
          <p className="text-f12 font-medium text-navy-70 mb-1">나이 / 몸무게</p>
          <div className="flex gap-3">
            <input
              type="text"
              inputMode="numeric"
              pattern="\d*"
              value={age}
              onChange={(e) => setAge(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="만 나이"
              className="flex-1 min-w-0 rounded-md px-4 py-3 bg-navy-5 text-f16 text-navy placeholder:text-navy-40 outline-none focus:ring-2 focus:ring-navy-15"
            />
            <input
              type="text"
              inputMode="decimal"
              pattern="[0-9]*\.?[0-9]*"
              value={weightKg}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9.]/g, '')
                const [integer, ...rest] = raw.split('.')
                setWeightKg(rest.length > 0 ? `${integer}.${rest.join('')}` : integer)
              }}
              placeholder="kg"
              className="flex-1 min-w-0 rounded-md px-4 py-3 bg-navy-5 text-f16 text-navy placeholder:text-navy-40 outline-none focus:ring-2 focus:ring-navy-15"
            />
          </div>
        </div>

        {/* 영토 색상 */}
        <div>
          <p className="text-f12 font-medium text-navy-70 mb-3">영토 색상</p>
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
                    'aspect-square rounded-lg flex items-center justify-center',
                    'transition-transform duration-150 active:scale-95',
                    isSelected ? 'ring-4 ring-navy ring-offset-2 ring-offset-cream' : '',
                  ].join(' ')}
                  style={{ backgroundColor: color.hex }}
                >
                  {isSelected && (
                    <span className="text-white text-f16 font-bold" aria-hidden="true">
                      ✓
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="px-6 pb-12">
        {submitError && <p className="text-f12 text-err text-center mb-3">{submitError}</p>}
        <Button variant="fill" size="lg" fullWidth onClick={handleSubmit} disabled={!isValid}>
          {isSubmitting ? '등록 중...' : '저장하기'}
        </Button>
      </div>

      {/* 마커/이미지 업로드 선택 */}
      {isActionSheetOpen && (
        <div
          className="absolute inset-0 z-20 flex flex-col justify-end bg-black/40"
          onClick={() => setIsActionSheetOpen(false)}
        >
          <div className="bg-cream rounded-t-xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-navy-15 mx-auto mt-3 mb-4" />
            <p className="px-6 pb-2 text-f12 font-medium text-navy-40">마커 이미지 선택</p>
            <button
              className="w-full px-6 py-4 text-left text-f16 text-navy font-medium border-t border-navy-8 active:bg-navy-5"
              onClick={handleSelectPreset}
            >
              기본 마커에서 선택
            </button>
            <button
              className="w-full px-6 py-4 text-left text-f16 text-navy font-medium border-t border-navy-8 active:bg-navy-5"
              onClick={handleSelectUpload}
            >
              앨범에서 업로드
            </button>
            <button
              className="w-full px-6 py-4 text-left text-f16 text-navy-40 border-t border-navy-8 active:bg-navy-5"
              onClick={() => setIsActionSheetOpen(false)}
            >
              취소
            </button>
            <div className="h-8" />
          </div>
        </div>
      )}

      {/* 마커 선택 */}
      {isPresetPickerOpen && (
        <div className="absolute inset-0 z-20 bg-cream flex flex-col">
          <div className="flex items-center justify-between px-6 pt-14 pb-4">
            <h2 className="text-f20 font-semibold text-navy">마커 선택</h2>
            <button
              onClick={() => setIsPresetPickerOpen(false)}
              className="text-f20 text-navy-70 leading-none"
              aria-label="닫기"
            >
              ✕
            </button>
          </div>

          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{
                width: `${presetPages.length * 100}%`,
                transform: `translateX(-${(presetPage * 100) / presetPages.length}%)`,
              }}
            >
              {presetPages.map((pagePresets, pi) => (
                <div
                  key={pi}
                  className="grid grid-cols-3 gap-4 px-6 py-4 content-start"
                  style={{ width: `${100 / presetPages.length}%` }}
                >
                  {pagePresets.map((preset) => {
                    const isSelected = selectedPresetId === preset.id
                    return (
                      <button
                        key={preset.id}
                        onClick={() => handlePresetSelect(preset.id)}
                        className="flex flex-col items-center gap-2 active:opacity-70"
                      >
                        <div
                          className={[
                            'w-full aspect-square rounded-xl overflow-hidden',
                            isSelected ? 'ring-4 ring-navy ring-offset-2 ring-offset-cream' : '',
                          ].join(' ')}
                        >
                          <img
                            src={preset.imageSrc}
                            alt={preset.label}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span
                          className={[
                            'text-f12 text-center leading-tight',
                            isSelected ? 'text-navy font-medium' : 'text-navy-70',
                          ].join(' ')}
                        >
                          {preset.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          {presetPages.length > 1 && (
            <div className="flex items-center justify-between px-6 py-4">
              <button
                onClick={() => setPresetPage((p) => Math.max(0, p - 1))}
                disabled={presetPage === 0}
                className="w-9 h-9 rounded-full bg-navy-8 flex items-center justify-center disabled:opacity-30 active:opacity-70"
                aria-label="이전 페이지"
              >
                <span className="text-navy leading-none">←</span>
              </button>
              <div className="flex gap-2">
                {presetPages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPresetPage(i)}
                    aria-label={`${i + 1}페이지`}
                    className={[
                      'w-2 h-2 rounded-full transition-colors',
                      i === presetPage ? 'bg-navy' : 'bg-navy-15',
                    ].join(' ')}
                  />
                ))}
              </div>
              <button
                onClick={() => setPresetPage((p) => Math.min(presetPages.length - 1, p + 1))}
                disabled={presetPage === presetPages.length - 1}
                className="w-9 h-9 rounded-full bg-navy-8 flex items-center justify-center disabled:opacity-30 active:opacity-70"
                aria-label="다음 페이지"
              >
                <span className="text-navy leading-none">→</span>
              </button>
            </div>
          )}

          <div className="flex-1" />

          <div className="px-6 pb-12">
            <Button variant="fill" size="lg" fullWidth onClick={() => setIsPresetPickerOpen(false)}>
              선택 완료
            </Button>
          </div>
        </div>
      )}

      {/* 견종 선택 */}
      {isBreedPickerOpen && (
        <div className="absolute inset-0 z-10 bg-cream flex flex-col">
          <div className="flex items-center px-6 pt-14 pb-4 border-b border-navy-15">
            <button
              onClick={() => setIsBreedPickerOpen(false)}
              className="mr-3 text-f20 text-navy-70 leading-none"
              aria-label="닫기"
            >
              ✕
            </button>
            <h2 className="text-f20 font-semibold text-navy">견종 선택</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {DOG_BREEDS.map((breed) => (
              <button
                key={breed.name_en}
                onClick={() => {
                  setSelectedBreed(breed)
                  if (breed.name_en !== 'Other') setCustomBreed('')
                  setIsBreedPickerOpen(false)
                }}
                className={[
                  'w-full px-6 py-4 text-left text-f16 border-b border-navy-8',
                  'transition-colors active:bg-navy-5',
                  selectedBreed?.name_en === breed.name_en
                    ? 'text-navy font-medium'
                    : 'text-navy-70',
                ].join(' ')}
              >
                {breed.name_ko}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
