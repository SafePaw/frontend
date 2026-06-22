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
import { useDogStore } from '../../stores/dogStore'
import { getDogMarkerUploadUrl, uploadDogMarkerToPresignedUrl } from '../../api/dogs'
import type { DogGender } from '../../types/dog'

const PRESETS_PER_PAGE = 9
const presetPages: DogMarkerPreset[][] = []
for (let i = 0; i < DOG_MARKER_PRESETS.length; i += PRESETS_PER_PAGE) {
  presetPages.push(DOG_MARKER_PRESETS.slice(i, i + PRESETS_PER_PAGE))
}

// 마커 이미지로 사용할 수 있는 타입
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
type AllowedMime = (typeof ALLOWED_MIME_TYPES)[number]

function isAllowedMime(type: string): type is AllowedMime {
  return (ALLOWED_MIME_TYPES as readonly string[]).includes(type)
}

export default function DogRegisterPage() {
  const navigate = useNavigate()
  const dogDraft = useDogStore((s) => s.dogDraft)
  const updateDraft = useDogStore((s) => s.updateDraft)

  const [name, setName] = useState(dogDraft.name)
  const [gender, setGender] = useState<DogGender | null>(dogDraft.gender)

  // 견종 '기타'인 경우 자유 기입
  const [selectedBreed, setSelectedBreed] = useState<DogBreedOption | null>(() => {
    if (!dogDraft.breed) return null
    const inList = DOG_BREEDS.find((b) => b.name_ko === dogDraft.breed)
    return inList ?? DOG_BREEDS.find((b) => b.name_en === 'Other') ?? null
  })
  const [customBreed, setCustomBreed] = useState<string>(() => {
    if (!dogDraft.breed) return ''
    const inList = DOG_BREEDS.find((b) => b.name_ko === dogDraft.breed)
    return inList ? '' : dogDraft.breed
  })
  const [isBreedPickerOpen, setIsBreedPickerOpen] = useState(false)

  const [age, setAge] = useState(dogDraft.age)
  const [weightKg, setWeightKg] = useState(dogDraft.weightKg)

  const [markerMode, setMarkerMode] = useState<'preset' | 'upload'>(
    dogDraft.markerImageType === 'UPLOADED' ? 'upload' : 'preset',
  )
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    dogDraft.markerImageType === 'PRESET' ? dogDraft.markerImageValue : DEFAULT_PRESET_ID,
  )
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string | null>(null)
  // presigned URL 업로드 완료 후 받은 storageKey — API 전송 시 markerImageValue로 사용
  const [markerStorageKey, setMarkerStorageKey] = useState<string | null>(
    dogDraft.markerImageType === 'UPLOADED' ? dogDraft.markerImageValue : null,
  )
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false) // 마커 선택
  const [isPresetPickerOpen, setIsPresetPickerOpen] = useState(false) // 프리셋 선택 모달
  const [presetPage, setPresetPage] = useState(0) // 프리셋 현재 페이지 인덱스

  // 견종
  const finalBreed =
    selectedBreed?.name_en === 'Other' ? customBreed.trim() : (selectedBreed?.name_ko ?? '')

  // 마커 이미지
  const currentMarkerSrc =
    markerMode === 'preset'
      ? (DOG_MARKER_PRESETS.find((p) => p.id === selectedPresetId)?.imageSrc ?? null)
      : uploadPreviewUrl

  // 업로드 모드인 경우 storageKey까지 받아야 준비 완료
  const isUploadReady =
    markerMode === 'preset' || (markerMode === 'upload' && markerStorageKey !== null)

  const isValid = name.trim().length > 0 && gender !== null && !isUploading && isUploadReady

  // 견종 버튼 표시 텍스트
  const breedDisplayText = (() => {
    if (!selectedBreed) return null
    return selectedBreed.name_en === 'Other' && customBreed.trim()
      ? customBreed.trim()
      : selectedBreed.name_ko
  })()

  // 파일 선택 시: presigned URL 발급 → S3 업로드 → storageKey 저장
  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!isAllowedMime(file.type)) {
      setUploadError('jpeg, png, webp 형식의 이미지만 업로드할 수 있어요.')
      return
    }

    setUploadError(null)
    setMarkerStorageKey(null)
    setUploadPreviewUrl(URL.createObjectURL(file)) // 업로드 전 미리보기
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

  // 프리셋 선택 모달
  function handleSelectPreset() {
    setIsActionSheetOpen(false)
    setIsPresetPickerOpen(true)
  }

  // 파일 직접 업로드
  function handleSelectUpload() {
    setMarkerMode('upload')
    setIsActionSheetOpen(false)
    setTimeout(() => fileInputRef.current?.click(), 50)
  }

  // 프리셋 선택 확정
  function handlePresetSelect(id: string) {
    setSelectedPresetId(id)
    setMarkerMode('preset')
    setMarkerStorageKey(null)
    setUploadPreviewUrl(null)
    setUploadError(null)
    setIsPresetPickerOpen(false)
  }

  // 입력값 dogStore로 저장
  function handleNext() {
    // 업로드 실패 시 PRESET
    const markerImageType = markerMode === 'upload' && markerStorageKey ? 'UPLOADED' : 'PRESET'
    const markerImageValue =
      markerMode === 'upload' && markerStorageKey ? markerStorageKey : selectedPresetId

    updateDraft({
      name: name.trim(),
      gender,
      breed: finalBreed,
      age,
      weightKg,
      markerImageType,
      markerImageValue,
    })
    navigate(ROUTES.ONBOARDING.COLOR)
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
        <div className="flex justify-center pt-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsActionSheetOpen(true)}
              className="w-28 h-28 rounded-full border-2 border-dashed border-navy-40 bg-navy-5 overflow-hidden flex flex-col items-center justify-center gap-1 active:opacity-70 transition-opacity"
              aria-label="마커 이미지 선택"
            >
              {isUploading ? (
                // 업로드 중 스피너
                <div className="w-6 h-6 rounded-full border-2 border-navy-15 border-t-navy animate-spin" />
              ) : currentMarkerSrc ? (
                // 선택된 이미지 미리보기
                <img
                  src={currentMarkerSrc}
                  alt="선택된 마커"
                  className="w-full h-full object-cover"
                />
              ) : markerStorageKey ? (
                // 드래프트 복원 시: object URL 없이 storageKey만 있는 상태
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
          {/* 기타 선택 */}
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

        <div>
          <p className="text-f12 font-medium text-navy-70 mb-2">
            성별 <span className="text-err">*</span>
          </p>
          <div className="flex gap-3">
            {(
              [
                { value: 'MALE', label: '수컷' },
                { value: 'FEMALE', label: '암컷' },
              ] as const
            ).map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setGender(value)}
                aria-pressed={gender === value}
                className={[
                  'flex-1 py-3 rounded-md text-f16 font-medium transition-colors',
                  gender === value ? 'bg-navy text-cream' : 'bg-navy-8 text-navy',
                ].join(' ')}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

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
      </div>

      <div className="px-6 pb-12">
        <Button variant="fill" size="lg" fullWidth onClick={handleNext} disabled={!isValid}>
          다음으로
        </Button>
      </div>

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
