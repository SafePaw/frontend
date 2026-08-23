import { useState } from 'react'
import type { RefCallback } from 'react'
import { formatTerritory } from '../../utils/rankingFormat'
import type { CrewRankingEntry } from '../../types/crewTerritory'

interface CrewRankingItemProps {
  item: CrewRankingEntry
  isMyCrew: boolean
  innerRef?: RefCallback<HTMLDivElement>
}

export default function CrewRankingItem({ item, isMyCrew, innerRef }: CrewRankingItemProps) {
  const [imgError, setImgError] = useState(false)
  const isTop3 = item.rank <= 3
  const showImage = item.imageUrl && !imgError

  return (
    <div
      ref={isMyCrew ? innerRef : undefined}
      className={`flex items-center gap-3 px-4 py-3 border-b border-navy-8 ${
        isMyCrew ? 'bg-navy-8 border-l-2 border-l-navy' : ''
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
                  : 'text-navy-70 font-medium'
          }`}
        >
          {item.rank}
        </span>
      </div>

      {/* 크루 이미지 */}
      <div
        className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center bg-navy-5 border-2"
        style={{ borderColor: item.territoryColor ?? '#2a3244' }}
      >
        {showImage ? (
          <img
            src={item.imageUrl!}
            alt={`${item.crewName} 이미지`}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <span
            className="w-full h-full rounded-full"
            style={{ backgroundColor: `${item.territoryColor ?? '#2a3244'}33` }}
          />
        )}
      </div>

      {/* 크루 정보 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-f14 font-semibold truncate text-navy">{item.crewName}</span>
          {isMyCrew && (
            <span className="text-f12 font-medium text-cream bg-navy rounded-full px-2 py-0.5 flex-shrink-0">
              내 크루
            </span>
          )}
        </div>
        <p className="text-f12 text-navy-70 mt-0.5">{item.memberCount}명</p>
      </div>

      {/* 면적 */}
      <div className="flex-shrink-0 text-right">
        <span className={`text-f13 font-semibold ${isTop3 ? 'text-navy' : 'text-navy-70'}`}>
          {formatTerritory(item.value)}
        </span>
      </div>
    </div>
  )
}
