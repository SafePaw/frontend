import { useState } from 'react'
import { DEFAULT_MARKER_IMAGE_SRC } from '../../utils/markerImage'
import { formatRankingValue } from '../../utils/rankingFormat'
import type { RankingItem as RankingItemType } from '../../types/ranking'
import type { DogRank } from '../../types/dog'

const RANK_BADGE_LABELS: Record<DogRank, string> = {
  PUPPY_WALKER: '새내기 산책러',
  NEIGHBORHOOD_EXPLORER: '동네 탐험가',
  STREET_STROLLER: '동네 산책꾼',
  TERRITORY_PIONEER: '영역 개척가',
  ALPHA_DOG: '알파 독',
}

interface RankingItemProps {
  item: RankingItemType
  isMe: boolean
}

export default function RankingItem({ item, isMe }: RankingItemProps) {
  const [imgError, setImgError] = useState(false)
  const markerSrc = !imgError && item.markerImageUrl ? item.markerImageUrl : DEFAULT_MARKER_IMAGE_SRC
  const isTop3 = item.rank <= 3
  const rankBadgeLabel = item.rankBadge ? (RANK_BADGE_LABELS[item.rankBadge] ?? null) : null

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 border-b border-navy-8 ${
        isMe ? 'bg-navy-8 border-l-2 border-l-navy' : ''
      }`}
    >
      {/* 순위 */}
      <div className="w-8 flex-shrink-0 flex items-center justify-center">
        <span
          className={`text-f14 font-bold ${
            item.rank === 1
              ? 'text-yellow-500'
              : item.rank === 2
                ? 'text-gray-400'
                : item.rank === 3
                  ? 'text-amber-600'
                  : 'text-navy-40 font-medium'
          }`}
        >
          {item.rank}
        </span>
      </div>

      {/* 마커 이미지 */}
      <div
        className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center bg-navy-5 border-2"
        style={{ borderColor: item.territoryColor ?? '#2a3244' }}
      >
        <img
          src={markerSrc}
          alt={item.dogName}
          className="w-8 h-8 object-contain"
          onError={() => setImgError(true)}
        />
      </div>

      {/* 강아지 정보 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className={`text-f14 font-semibold truncate ${isTop3 ? 'text-navy' : 'text-navy'}`}
          >
            {item.dogName}
          </span>
          {isMe && (
            <span className="text-f10 font-medium text-cream bg-navy rounded-full px-1.5 py-0.5 flex-shrink-0">
              내 강아지
            </span>
          )}
        </div>
        {rankBadgeLabel && (
          <p className="text-f12 text-navy-40 mt-0.5 truncate">{rankBadgeLabel}</p>
        )}
      </div>

      {/* 점수 */}
      <div className="flex-shrink-0 text-right">
        <span className={`text-f13 font-semibold ${isTop3 ? 'text-navy' : 'text-navy-70'}`}>
          {formatRankingValue(item.value, item.unit)}
        </span>
      </div>
    </div>
  )
}
