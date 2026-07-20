import { useNavigate } from 'react-router-dom'
import Button from '../ui/button'
import { ROUTES } from '../../constants/routes'
import { resolveMarkerImage, DEFAULT_MARKER_IMAGE_SRC } from '../../utils/markerImage'
import type { Dog } from '../../types/dog'

interface HomeDogCardProps {
  dogs: Dog[]
  selectedDogId: number | null
  onSelectDog: (dogId: number) => void
  hasActiveWalk: boolean
}

export default function HomeDogCard({
  dogs,
  selectedDogId,
  onSelectDog,
  hasActiveWalk,
}: HomeDogCardProps) {
  const navigate = useNavigate()
  const selectedDog = dogs.find((d) => d.id === selectedDogId) ?? null
  const canCycle = dogs.length > 1

  if (dogs.length === 0) {
    return (
      <div className="flex items-center justify-between px-5 py-4 gap-3">
        <div className="min-w-0">
          <p className="text-f16 font-semibold text-navy">등록된 강아지가 없어요</p>
          <p className="text-f12 text-navy-40 mt-0.5">강아지를 등록하고 산책을 시작해 보세요</p>
        </div>
        <Button variant="fill" size="sm" onClick={() => navigate(ROUTES.DOGS.REGISTRATION)}>
          강아지 등록하기
        </Button>
      </div>
    )
  }

  const markerSrc = selectedDog
    ? resolveMarkerImage({
        markerImageType: selectedDog.markerImageType,
        markerImageValue: selectedDog.markerImageValue,
        markerImageUrl: selectedDog.markerImageUrl,
      })
    : DEFAULT_MARKER_IMAGE_SRC

  function cycleNext() {
    const currentIdx = dogs.findIndex((d) => d.id === selectedDogId)
    const nextIdx = (currentIdx + 1) % dogs.length
    onSelectDog(dogs[nextIdx].id)
  }

  return (
    <div className="flex items-center gap-3 px-5 py-4">
      <button
        onClick={canCycle ? cycleNext : undefined}
        disabled={!canCycle}
        aria-label={canCycle ? '다른 강아지 선택' : (selectedDog?.name ?? '강아지')}
        className={[
          'w-12 h-12 rounded-full overflow-hidden bg-navy-5 flex-shrink-0',
          'flex items-center justify-center border-2',
          canCycle
            ? 'border-navy cursor-pointer active:opacity-70 transition-opacity'
            : 'border-navy-15',
        ].join(' ')}
      >
        <img
          src={markerSrc}
          alt={selectedDog?.name ?? '강아지'}
          className="w-9 h-9 object-contain"
          onError={(e) => {
            ;(e.currentTarget as HTMLImageElement).src = DEFAULT_MARKER_IMAGE_SRC
          }}
        />
      </button>

      <div className="flex-1 min-w-0">
        <p className="text-f16 font-semibold text-navy truncate">{selectedDog?.name ?? '강아지'}</p>
        {canCycle && <p className="text-f12 text-navy-40">탭하여 변경</p>}
      </div>

      <Button
        variant="fill"
        size="md"
        onClick={() => navigate(hasActiveWalk ? ROUTES.WALK.ACTIVE : ROUTES.WALK.READY)}
      >
        🐾 {hasActiveWalk ? '이어서 하기' : '산책 시작'}
      </Button>
    </div>
  )
}
