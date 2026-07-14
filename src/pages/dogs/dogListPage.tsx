import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { getDogs } from '../../api/dogs'
import { resolveMarkerImage } from '../../utils/markerImage'
import Button from '../../components/ui/button'
import type { Dog } from '../../types/dog'

const MAX_DOGS = 5

function formatDogInfo(dog: Dog): string {
  const parts: string[] = []
  if (dog.breed) parts.push(dog.breed)
  parts.push(dog.gender === 'MALE' ? '수컷' : '암컷')
  if (dog.age !== null) parts.push(`${dog.age}살`)
  if (dog.weightKg !== null) parts.push(`${dog.weightKg}kg`)
  return parts.join(' · ')
}

export default function DogListPage() {
  const navigate = useNavigate()
  const [dogs, setDogs] = useState<Dog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getDogs()
      .then(setDogs)
      .catch(() => setError('강아지 목록을 불러오지 못했어요.'))
      .finally(() => setIsLoading(false))
  }, [])

  const canAdd = dogs.length < MAX_DOGS

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-cream items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-navy-15 border-t-navy animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col h-full bg-cream items-center justify-center px-6 gap-4">
        <p className="text-f16 text-navy-70 text-center">{error}</p>
        <Button variant="ghost" onClick={() => window.location.reload()}>
          다시 시도
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-cream">
      <div className="flex items-center px-6 pt-14 pb-2">
        <button
          onClick={() => navigate(-1)}
          className="mr-3 text-f20 text-navy-70 leading-none"
          aria-label="뒤로가기"
        >
          ←
        </button>
        <h1 className="text-f20 font-semibold text-navy">강아지 프로필</h1>
      </div>
      <p className="px-6 pb-6 text-f12 text-navy-40">최대 {MAX_DOGS}마리까지 등록 가능</p>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {dogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 pb-20">
            <span className="text-f40" aria-hidden="true">🐾</span>
            <p className="text-f16 text-navy-40">아직 등록된 강아지가 없어요</p>
            <Button variant="fill" onClick={() => navigate(ROUTES.DOGS.REGISTRATION)}>
              강아지 등록하기
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {dogs.map((dog) => (
              <div
                key={dog.id}
                className="bg-navy-5 rounded-xl px-5 py-4 flex items-center gap-4"
              >
                <img
                  src={resolveMarkerImage({
                    markerImageType: dog.markerImageType,
                    markerImageValue: dog.markerImageValue,
                    markerImageUrl: dog.markerImageUrl,
                  })}
                  alt={`${dog.name} 마커 이미지`}
                  className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-f16 font-semibold text-navy">{dog.name}</p>
                  </div>
                  <p className="text-f12 text-navy-40 mt-0.5">{formatDogInfo(dog)}</p>
                </div>

                <button
                  onClick={() => navigate(ROUTES.DOGS.DETAIL_OF(dog.id))}
                  className="text-f12 text-navy-70 flex-shrink-0 active:opacity-70 transition-opacity"
                >
                  수정 ›
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-6 pb-12">
        <Button
          variant={canAdd ? 'fill' : 'ghost'}
          size="lg"
          fullWidth
          disabled={!canAdd}
          onClick={() => navigate(ROUTES.DOGS.REGISTRATION)}
        >
          {canAdd
            ? `+ 강아지 추가 (${dogs.length}/${MAX_DOGS})`
            : `최대 ${MAX_DOGS}마리까지 등록 가능 (${dogs.length}/${MAX_DOGS})`}
        </Button>
      </div>
    </div>
  )
}
