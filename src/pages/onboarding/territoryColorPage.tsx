import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/button'
import { ROUTES } from '../../constants/routes'
import { useDogStore } from '../../stores/dogStore'
import { createDog } from '../../api/dogs'
import { TERRITORY_COLORS, DEFAULT_TERRITORY_COLOR_HEX } from '../../constants/territoryColors'
import type { CreateDogRequest } from '../../types/dog'

export default function TerritoryColorPage() {
  const navigate = useNavigate()
  const dogDraft = useDogStore((s) => s.dogDraft)
  const setCreatedDog = useDogStore((s) => s.setCreatedDog)
  const resetDraft = useDogStore((s) => s.resetDraft)

  const [selectedColor, setSelectedColor] = useState<string>(DEFAULT_TERRITORY_COLOR_HEX)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    setError(null)
    setIsLoading(true)

    try {
      const ageNum = dogDraft.age ? parseInt(dogDraft.age, 10) : undefined
      const weightNum = dogDraft.weightKg ? parseFloat(dogDraft.weightKg) : undefined

      const body: CreateDogRequest = {
        name: dogDraft.name,
        ...(dogDraft.gender ? { gender: dogDraft.gender } : {}),
        ...(dogDraft.breed ? { breed: dogDraft.breed } : {}),
        ...(ageNum !== undefined && !isNaN(ageNum) ? { age: ageNum } : {}),
        ...(weightNum !== undefined && !isNaN(weightNum) ? { weightKg: weightNum } : {}),
        markerImageType: dogDraft.markerImageType,
        markerImageValue: dogDraft.markerImageValue,
        territoryColor: selectedColor,
      }

      const dog = await createDog(body)
      setCreatedDog(dog)
      resetDraft()
      navigate(ROUTES.ONBOARDING.TUTORIAL, { replace: true })
    } catch {
      setError('강아지 등록에 실패했어요. 다시 시도해 주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-cream">
      <div className="flex items-center px-6 pt-14 pb-6">
        <button
          onClick={() => navigate(-1)}
          className="mr-3 text-f20 text-navy-70 leading-none"
          aria-label="뒤로가기"
        >
          ←
        </button>
        <h1 className="text-f20 font-semibold text-navy">영토 색상 선택</h1>
      </div>

      <div className="flex-1 px-6">
        <p className="text-f16 text-navy-70 mb-8">내 영토가 지도에 이 색상으로 표시돼요</p>

        <div className="grid grid-cols-3 gap-4">
          {TERRITORY_COLORS.map((color) => {
            const isSelected = selectedColor === color.hex
            return (
              <button
                key={color.hex}
                onClick={() => setSelectedColor(color.hex)}
                aria-label={color.label}
                aria-pressed={isSelected}
                className={[
                  'aspect-square rounded-xl flex items-center justify-center',
                  'transition-transform duration-150 active:scale-95',
                  isSelected ? 'ring-4 ring-navy ring-offset-2 ring-offset-cream' : '',
                ].join(' ')}
                style={{ backgroundColor: color.hex }}
              >
                {isSelected && (
                  <span className="text-white text-2xl font-bold" aria-hidden="true">
                    ✓
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="px-6 pb-12">
        {error && <p className="text-f12 text-err text-center mb-3">{error}</p>}
        <Button variant="fill" size="lg" fullWidth onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? '등록 중...' : '등록 완료'}
        </Button>
      </div>
    </div>
  )
}
