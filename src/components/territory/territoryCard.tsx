import { useState } from 'react'
import { DEFAULT_MARKER_IMAGE_SRC, resolveMarkerImage } from '../../utils/markerImage'
import type { TerritorySummary, TerritoryDetail } from '../../types/territory'
import type { DogRank } from '../../types/dog'

const RANK_LABELS: Record<DogRank, string> = {
  PUPPY_WALKER: '새내기 산책러',
  NEIGHBORHOOD_EXPLORER: '동네 탐험가',
  STREET_STROLLER: '동네 산책꾼',
  TERRITORY_PIONEER: '영역 개척가',
  ALPHA_DOG: '알파 독',
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}.`
}

function formatArea(m2: number): string {
  return `${Math.round(m2).toLocaleString()}㎡`
}

interface TerritoryCardProps {
  territory: TerritorySummary
  detail: TerritoryDetail | null
  isLoadingDetail: boolean
  onClose: () => void
}

export default function TerritoryCard({
  territory,
  detail,
  isLoadingDetail,
  onClose,
}: TerritoryCardProps) {
  const [imgError, setImgError] = useState(false)
  const { dog, areaSquareMeters, claimedAt, isMine, status } = territory

  const markerSrc = imgError
    ? DEFAULT_MARKER_IMAGE_SRC
    : resolveMarkerImage({
        markerImageType: dog.markerImageType,
        markerImageValue: dog.markerImageValue,
        markerImageUrl: dog.markerImageUrl,
      })
  const imgFit = dog.markerImageType === 'UPLOADED' ? 'object-cover' : 'object-contain'

  const rankLabel = RANK_LABELS[dog.rank] ?? dog.rank
  const isConquered = status === 'CONQUERED'

  return (
    <div className="bg-cream rounded-xl border border-navy-15 shadow-md px-4 py-4">
      <div className="flex items-start gap-3">
        {/* 강아지 마커 */}
        <div
          className="w-12 h-12 rounded-full flex-shrink-0 overflow-hidden border-2 flex items-center justify-center bg-navy-5"
          style={{ borderColor: dog.territoryColor }}
        >
          <img
            src={markerSrc}
            alt={dog.name}
            className={`w-10 h-10 ${imgFit}`}
            onError={() => setImgError(true)}
          />
        </div>

        {/* 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-f16 font-semibold text-navy truncate">{dog.name}</span>
            {isMine && (
              <span className="text-f12 font-medium text-cream bg-navy rounded-full px-2 py-0.5 flex-shrink-0">
                내 영토
              </span>
            )}
            {isConquered && (
              <span className="text-f12 font-medium text-cream bg-err rounded-full px-2 py-0.5 flex-shrink-0">
                빼앗긴 영토
              </span>
            )}
          </div>
          <p className="text-f12 text-navy-70 mt-0.5">{rankLabel}</p>

          <div className="mt-2 space-y-0.5">
            {!isConquered && (
              <p className="text-f12 text-navy-70">
                <span className="font-medium text-navy">{formatArea(areaSquareMeters)}</span>
              </p>
            )}
            <p className="text-f12 text-navy-70">{formatDate(claimedAt)} 획득</p>

            {/* 상세 로딩 */}
            {isLoadingDetail && (
              <div className="flex items-center gap-1 mt-1">
                <div className="w-3 h-3 rounded-full border border-navy-15 border-t-navy animate-spin" />
                <span className="text-f12 text-navy-70">상세 정보 불러오는 중...</span>
              </div>
            )}

            {/* 정복된 땅 상세 */}
            {detail && isConquered && (
              <>
                {detail.conqueredAt && (
                  <p className="text-f12 text-err">{formatDate(detail.conqueredAt)} 빼앗김</p>
                )}
                {detail.conqueredBy && (
                  <p className="text-f12 text-navy-40">{detail.conqueredBy.dogName}에게 빼앗김</p>
                )}
              </>
            )}
          </div>
        </div>

        {/* 닫기  */}
        <button
          onClick={onClose}
          aria-label="닫기"
          className="w-7 h-7 flex items-center justify-center text-navy-40 hover:text-navy flex-shrink-0 active:opacity-70 transition-opacity"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path
              d="M1 1L13 13M13 1L1 13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
