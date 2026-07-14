import { useState, useEffect, useRef, type ChangeEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/ui/button'
import { ROUTES } from '../../constants/routes'
import { DOG_BREEDS, type DogBreedOption } from '../../constants/dogBreeds'
import {
  DOG_MARKER_PRESETS,
  DEFAULT_PRESET_ID,
  type DogMarkerPreset,
} from '../../constants/dogMarkers'
import { TERRITORY_COLORS } from '../../constants/territoryColors'
import {
  getDogs,
  updateDog,
  deleteDog,
  getDogMarkerUploadUrl,
  uploadDogMarkerToPresignedUrl,
} from '../../api/dogs'
import {
  resolveMarkerImage,
  toFrontendPresetId,
  toBackendPresetValue,
  isPresetMarkerSelected,
} from '../../utils/markerImage'
import type { Dog, DogGender, DogRank, UpdateDogRequest } from '../../types/dog'

const RANK_LABELS: Record<DogRank, string> = {
  PUPPY_WALKER: '새내기 산책러',
  NEIGHBORHOOD_EXPLORER: '동네 탐험가',
  STREET_STROLLER: '동네 산책꾼',
  TERRITORY_PIONEER: '영역 개척가',
  ALPHA_DOG: '알파 독',
}

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

export default function DogDetailPage() {
  const { dogId } = useParams()
  const navigate = useNavigate()

  const [dog, setDog] = useState<Dog | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editGender, setEditGender] = useState<DogGender | null>(null)
  const [editSelectedBreed, setEditSelectedBreed] = useState<DogBreedOption | null>(null)
  const [editCustomBreed, setEditCustomBreed] = useState('')
  const [editAge, setEditAge] = useState('')
  const [editWeightKg, setEditWeightKg] = useState('')
  const [editTerritoryColor, setEditTerritoryColor] = useState('')
  const [isBreedPickerOpen, setIsBreedPickerOpen] = useState(false)

  // 마커 수정: 'current'는 기존 이미지 유지, 'preset'/'upload'은 변경 시
  const [editMarkerMode, setEditMarkerMode] = useState<'current' | 'preset' | 'upload'>('current')
  const [editSelectedPresetId, setEditSelectedPresetId] = useState(DEFAULT_PRESET_ID)
  const [editUploadPreviewUrl, setEditUploadPreviewUrl] = useState<string | null>(null)
  const [editMarkerStorageKey, setEditMarkerStorageKey] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false)
  const [isPresetPickerOpen, setIsPresetPickerOpen] = useState(false)
  const [presetPage, setPresetPage] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isUpdating, setIsUpdating] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)

  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDog = async () => {
      if (!dogId || isNaN(Number(dogId))) {
        navigate(ROUTES.DOGS.INDEX, { replace: true })
        return
      }
      try {
        const dogs = await getDogs()
        const found = dogs.find((d) => d.id === Number(dogId))
        if (!found) {
          navigate(ROUTES.DOGS.INDEX, { replace: true })
          return
        }
        setDog(found)
      } catch {
        setFetchError('강아지 정보를 불러오지 못했어요.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchDog()
  }, [dogId, navigate])

  function enterEditMode() {
    if (!dog) return
    setEditName(dog.name)
    setEditGender(dog.gender)
    setEditTerritoryColor(dog.territoryColor)
    setEditAge(dog.age !== null ? String(dog.age) : '')
    setEditWeightKg(dog.weightKg !== null ? String(dog.weightKg) : '')

    if (dog.breed) {
      const inList = DOG_BREEDS.find((b) => b.name_ko === dog.breed)
      if (inList) {
        setEditSelectedBreed(inList)
        setEditCustomBreed('')
      } else {
        const other = DOG_BREEDS.find((b) => b.name_en === 'Other') ?? null
        setEditSelectedBreed(other)
        setEditCustomBreed(dog.breed)
      }
    } else {
      setEditSelectedBreed(null)
      setEditCustomBreed('')
    }

    setEditMarkerMode('current')
    setEditSelectedPresetId(
      dog.markerImageType === 'PRESET'
        ? (toFrontendPresetId(dog.markerImageValue) ?? DEFAULT_PRESET_ID)
        : DEFAULT_PRESET_ID,
    )
    setEditUploadPreviewUrl(null)
    setEditMarkerStorageKey(null)
    setUploadError(null)
    setUpdateError(null)
    setIsEditing(true)
  }

  function cancelEdit() {
    setIsEditing(false)
    setUpdateError(null)
    setUploadError(null)
  }

  const editFinalBreed =
    editSelectedBreed?.name_en === 'Other'
      ? editCustomBreed.trim()
      : (editSelectedBreed?.name_ko ?? '')

  const editBreedDisplayText = (() => {
    if (!editSelectedBreed) return null
    return editSelectedBreed.name_en === 'Other' && editCustomBreed.trim()
      ? editCustomBreed.trim()
      : editSelectedBreed.name_ko
  })()

  function getEditMarkerSrc(): string | null {
    if (editMarkerMode === 'upload') return editUploadPreviewUrl
    if (editMarkerMode === 'preset') {
      return DOG_MARKER_PRESETS.find((p) => p.id === editSelectedPresetId)?.imageSrc ?? null
    }
    if (!dog) return null
    return resolveMarkerImage({
      markerImageType: dog.markerImageType,
      markerImageValue: dog.markerImageValue,
      markerImageUrl: dog.markerImageUrl,
    })
  }

  const isUploadReady = editMarkerMode !== 'upload' || editMarkerStorageKey !== null
  const isEditValid =
    editName.trim().length > 0 && editGender !== null && !isUploading && isUploadReady

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!isAllowedMime(file.type)) {
      setUploadError('jpeg, png, webp 형식의 이미지만 업로드할 수 있어요.')
      return
    }
    setUploadError(null)
    setEditMarkerStorageKey(null)
    setEditUploadPreviewUrl(URL.createObjectURL(file))
    setIsUploading(true)
    setEditMarkerMode('upload')
    try {
      const { uploadUrl, storageKey } = await getDogMarkerUploadUrl({ contentType: file.type })
      await uploadDogMarkerToPresignedUrl(uploadUrl, file, file.type)
      setEditMarkerStorageKey(storageKey)
    } catch {
      setUploadError('이미지 업로드에 실패했어요. 다시 시도해 주세요.')
      setEditUploadPreviewUrl(null)
      setEditMarkerMode('current')
    } finally {
      setIsUploading(false)
    }
  }

  function handleSelectPreset() {
    setIsActionSheetOpen(false)
    setIsPresetPickerOpen(true)
  }

  function handleSelectUpload() {
    setIsActionSheetOpen(false)
    setTimeout(() => fileInputRef.current?.click(), 50)
  }

  function handlePresetSelect(id: string) {
    setEditSelectedPresetId(id)
    setEditMarkerMode('preset')
    setEditMarkerStorageKey(null)
    setEditUploadPreviewUrl(null)
    setUploadError(null)
    setIsPresetPickerOpen(false)
  }

  async function handleUpdate() {
    if (!dog || !isEditValid || !editGender) return
    setIsUpdating(true)
    setUpdateError(null)
    try {
      const ageNum = editAge ? parseInt(editAge, 10) : undefined
      const weightNum = editWeightKg ? parseFloat(editWeightKg) : undefined

      const body: UpdateDogRequest = {
        name: editName.trim(),
        gender: editGender,
        ...(editFinalBreed ? { breed: editFinalBreed } : {}),
        ...(ageNum !== undefined && !isNaN(ageNum) ? { age: ageNum } : {}),
        ...(weightNum !== undefined && !isNaN(weightNum) ? { weightKg: weightNum } : {}),
        territoryColor: editTerritoryColor,
      }

      if (editMarkerMode === 'preset') {
        body.markerImageType = 'PRESET'
        body.markerImageValue = toBackendPresetValue(editSelectedPresetId) ?? 'preset-01'
      } else if (editMarkerMode === 'upload' && editMarkerStorageKey) {
        body.markerImageType = 'UPLOADED'
        body.markerImageValue = editMarkerStorageKey
      }

      await updateDog(dog.id, body)

      const dogs = await getDogs()
      const refreshed = dogs.find((item) => item.id === dog.id)

      setDog(refreshed ?? dog)
      setIsEditing(false)
    } catch {
      setUpdateError('수정에 실패했어요. 다시 시도해 주세요.')
    } finally {
      setIsUpdating(false)
    }
  }

  async function handleDelete() {
    if (!dog) return
    setIsDeleting(true)
    setDeleteError(null)
    try {
      await deleteDog(dog.id)
      navigate(ROUTES.DOGS.INDEX, { replace: true })
    } catch {
      setDeleteError('삭제에 실패했어요. 다시 시도해 주세요.')
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-cream items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-navy-15 border-t-navy animate-spin" />
      </div>
    )
  }

  if (fetchError || !dog) {
    return (
      <div className="flex flex-col h-full bg-cream items-center justify-center px-6 gap-4">
        <p className="text-f16 text-navy-70 text-center">
          {fetchError ?? '강아지 정보를 불러오지 못했어요.'}
        </p>
        <Button variant="ghost" onClick={() => navigate(ROUTES.DOGS.INDEX)}>
          목록으로 돌아가기
        </Button>
      </div>
    )
  }

  const editMarkerSrc = getEditMarkerSrc()

  return (
    <div className="relative flex flex-col h-full bg-cream">
      <div className="flex items-center justify-between px-6 pt-14 pb-6">
        <button
          onClick={() => (isEditing ? cancelEdit() : navigate(-1))}
          className="text-f20 text-navy-70 leading-none"
          aria-label={isEditing ? '취소' : '뒤로가기'}
        >
          ←
        </button>
        <h1 className="text-f20 font-semibold text-navy">{isEditing ? '프로필 수정' : dog.name}</h1>
        {isEditing ? (
          <button
            onClick={() => setIsConfirmingDelete(true)}
            className="text-f16 text-err font-medium"
          >
            삭제
          </button>
        ) : (
          <button onClick={enterEditMode} className="text-f16 text-navy-70 font-medium">
            수정
          </button>
        )}
      </div>

      {/* 상세 보기 */}
      {!isEditing && (
        <div className="flex-1 overflow-y-auto px-6 pb-12 space-y-5">
          <div className="flex justify-center pt-2">
            <img
              src={resolveMarkerImage({
                markerImageType: dog.markerImageType,
                markerImageValue: dog.markerImageValue,
                markerImageUrl: dog.markerImageUrl,
              })}
              alt={dog.name}
              className="w-28 h-28 rounded-full object-cover"
            />
          </div>

          <div className="bg-navy-5 rounded-xl divide-y divide-navy-8">
            {[
              { label: '이름', value: dog.name },
              { label: '견종', value: dog.breed ?? '미입력' },
              { label: '성별', value: dog.gender === 'MALE' ? '수컷' : '암컷' },
              { label: '나이', value: dog.age !== null ? `${dog.age}살` : '미입력' },
              {
                label: '몸무게',
                value: dog.weightKg !== null ? `${dog.weightKg}kg` : '미입력',
              },
            ].map(({ label, value }) => (
              <div key={label} className="px-5 py-4 flex items-center justify-between">
                <span className="text-f12 text-navy-40 font-medium">{label}</span>
                <span className="text-f16 text-navy">{value}</span>
              </div>
            ))}
            <div className="px-5 py-4 flex items-center justify-between">
              <span className="text-f12 text-navy-40 font-medium">영토 색상</span>
              <div
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: dog.territoryColor }}
              />
            </div>
          </div>

          <div className="bg-navy-5 rounded-xl divide-y divide-navy-8">
            <div className="px-5 py-4 flex items-center justify-between">
              <span className="text-f12 text-navy-40 font-medium">랭크</span>
              <span className="text-f16 text-navy">{RANK_LABELS[dog.rank]}</span>
            </div>
            <div className="px-5 py-4 flex items-center justify-between">
              <span className="text-f12 text-navy-40 font-medium">총 XP</span>
              <span className="text-f16 text-navy">{dog.totalXp}</span>
            </div>
          </div>
        </div>
      )}

      {/* 수정  */}
      {isEditing && (
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">
          {/* 마커 이미지 수정 */}
          <div className="flex justify-center pt-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsActionSheetOpen(true)}
                className="w-28 h-28 rounded-full border-2 border-dashed border-navy-40 bg-navy-5 overflow-hidden flex flex-col items-center justify-center gap-1 active:opacity-70 transition-opacity"
                aria-label="마커 이미지 변경"
              >
                {isUploading ? (
                  <div className="w-6 h-6 rounded-full border-2 border-navy-15 border-t-navy animate-spin" />
                ) : editMarkerSrc ? (
                  <img
                    src={editMarkerSrc}
                    alt="마커 이미지"
                    className="w-full h-full object-cover"
                  />
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
                <span className="text-cream text-f16 font-medium leading-none">✎</span>
              </button>
            </div>
          </div>

          {uploadError && <p className="text-f12 text-err text-center -mt-2">{uploadError}</p>}

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
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
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
              {editBreedDisplayText ? (
                <span className="text-navy">{editBreedDisplayText}</span>
              ) : (
                <span className="text-navy-40">견종 선택</span>
              )}
              <span className="text-navy-40 text-f12">▾</span>
            </button>
            {editSelectedBreed?.name_en === 'Other' && (
              <input
                type="text"
                value={editCustomBreed}
                onChange={(e) => setEditCustomBreed(e.target.value)}
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
                  onClick={() => setEditGender(value)}
                  aria-pressed={editGender === value}
                  className={[
                    'flex-1 py-3 rounded-md text-f16 font-medium transition-colors',
                    editGender === value ? 'bg-navy text-cream' : 'bg-navy-8 text-navy',
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
                value={editAge}
                onChange={(e) => setEditAge(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="만 나이"
                className="flex-1 min-w-0 rounded-md px-4 py-3 bg-navy-5 text-f16 text-navy placeholder:text-navy-40 outline-none focus:ring-2 focus:ring-navy-15"
              />
              <input
                type="text"
                inputMode="decimal"
                pattern="[0-9]*\.?[0-9]*"
                value={editWeightKg}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9.]/g, '')
                  const [integer, ...rest] = raw.split('.')
                  setEditWeightKg(rest.length > 0 ? `${integer}.${rest.join('')}` : integer)
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
                const isSelected = editTerritoryColor === color.hex
                return (
                  <button
                    key={color.hex}
                    onClick={() => setEditTerritoryColor(color.hex)}
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
      )}

      {isEditing && (
        <div className="px-6 pb-12 space-y-3">
          {updateError && <p className="text-f12 text-err text-center">{updateError}</p>}
          <Button
            variant="fill"
            size="lg"
            fullWidth
            onClick={handleUpdate}
            disabled={!isEditValid || isUpdating}
          >
            {isUpdating ? '저장 중...' : '저장하기'}
          </Button>
        </div>
      )}

      {/* 삭제 확인 */}
      {isConfirmingDelete && (
        <div
          className="absolute inset-0 z-20 flex flex-col justify-end bg-black/40"
          onClick={() => !isDeleting && setIsConfirmingDelete(false)}
        >
          <div className="bg-cream rounded-t-xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-navy-15 mx-auto mt-3 mb-4" />
            <p className="px-6 pb-1 text-f20 font-semibold text-navy">정말 삭제할까요?</p>
            <p className="px-6 pb-6 text-f12 text-navy-40">
              {dog.name}의 정보가 영구적으로 삭제됩니다.
            </p>
            {deleteError && <p className="px-6 pb-3 text-f12 text-err">{deleteError}</p>}
            <div className="px-6 pb-3">
              <Button
                variant="danger"
                size="lg"
                fullWidth
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? '삭제 중...' : '삭제'}
              </Button>
            </div>
            <div className="px-6 pb-12">
              <Button
                variant="ghost"
                size="lg"
                fullWidth
                onClick={() => setIsConfirmingDelete(false)}
                disabled={isDeleting}
              >
                취소
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 마커 /이미지 업로드 선택 */}
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
                    const isSelected =
                      editMarkerMode === 'preset'
                        ? editSelectedPresetId === preset.id
                        : isPresetMarkerSelected({
                            dogMarkerImageType: dog.markerImageType,
                            dogMarkerImageValue: dog.markerImageValue,
                            frontendPresetId: preset.id,
                          })
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

      {/* 견종 */}
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
                  setEditSelectedBreed(breed)
                  if (breed.name_en !== 'Other') setEditCustomBreed('')
                  setIsBreedPickerOpen(false)
                }}
                className={[
                  'w-full px-6 py-4 text-left text-f16 border-b border-navy-8',
                  'transition-colors active:bg-navy-5',
                  editSelectedBreed?.name_en === breed.name_en
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
