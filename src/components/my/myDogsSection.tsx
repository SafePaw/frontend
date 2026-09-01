import { useState } from 'react'
import { resolveMarkerImage, DEFAULT_MARKER_IMAGE_SRC } from '../../utils/markerImage'
import Button from '../ui/button'
import pawImg from '../../assets/paw.png'
import type { MeDogSummary } from '../../types/me'
import type { Dog, DogRank } from '../../types/dog'

const RANK_LABELS: Record<DogRank, string> = {
  PUPPY_WALKER: '새내기 산책러',
  NEIGHBORHOOD_EXPLORER: '동네 탐험가',
  STREET_STROLLER: '동네 산책꾼',
  TERRITORY_PIONEER: '영역 개척가',
  ALPHA_DOG: '알파 독',
}

function formatRank(rank: DogRank): string {
  return RANK_LABELS[rank]
}

function formatGender(gender: string): string {
  if (gender === 'MALE') return '수컷'
  if (gender === 'FEMALE') return '암컷'
  return '성별 미등록'
}

interface Props {
  dogs: MeDogSummary[]
  dogDetailMap: Map<number, Dog>
  onNavigateDog: (id: number) => void
  onRegister: () => void
}

export default function MyDogsSection({ dogs, dogDetailMap, onNavigateDog, onRegister }: Props) {
  return (
    <div>
      <div className="mb-3">
        <p className="text-f16 font-semibold text-navy">내 강아지</p>
      </div>

      {dogs.length === 0 ? (
        <div className="bg-navy-5 rounded-xl px-5 py-8 flex flex-col items-center gap-3">
          <img src={pawImg} alt="" className="w-10 h-10" />
          <p className="text-f16 text-navy-70">아직 등록된 강아지가 없어요</p>
          <Button variant="ghost" size="sm" onClick={onRegister}>
            강아지 등록하기
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {dogs.map((dog) => {
            const displayName = dog.name && dog.name.trim() ? dog.name : null
            const genderLabel = formatGender(dog.gender)
            const rankLabel = formatRank(dog.rank)
            const hasXp = typeof dog.totalXp === 'number'

            return (
              <button
                key={dog.id}
                onClick={() => onNavigateDog(dog.id)}
                className="w-full bg-navy-5 rounded-xl px-5 py-4 flex items-center gap-4 text-left active:opacity-70 transition-opacity"
              >
                <DogAvatarImg dog={dog} detail={dogDetailMap.get(dog.id)} />
                <div className="flex-1 min-w-0">
                  {displayName ? (
                    <p className="text-f16 font-semibold text-navy truncate">{displayName}</p>
                  ) : (
                    <p className="text-f16 italic text-navy-70 truncate">이름을 등록해주세요</p>
                  )}
                  <p className="text-f12 text-navy-70 mt-0.5 truncate">
                    {genderLabel} · {rankLabel}
                    {hasXp ? ` · XP ${dog.totalXp.toLocaleString()}` : ''}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: dog.territoryColor }}
                      aria-hidden="true"
                    />
                    <span className="text-f8 text-navy-70">영토 색상</span>
                  </div>
                </div>
                <span className="text-navy-70 text-f16 flex-shrink-0" aria-hidden="true">
                  ›
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function DogAvatarImg({ dog, detail }: { dog: MeDogSummary; detail?: Dog }) {
  const [imgError, setImgError] = useState(false)

  return (
    <img
      src={
        imgError
          ? DEFAULT_MARKER_IMAGE_SRC
          : resolveMarkerImage({
              markerImageType: detail?.markerImageType ?? dog.markerImageType,
              markerImageValue: detail?.markerImageValue ?? dog.markerImageValue,
              markerImageUrl: detail?.markerImageUrl ?? dog.markerImageUrl,
            })
      }
      alt={dog.name || '강아지'}
      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
      onError={() => setImgError(true)}
    />
  )
}
