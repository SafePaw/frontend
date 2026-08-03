import { formatRankingValue } from '../../utils/rankingFormat'
import type { RankingCategoryKey, MyCategoryRanking } from '../../types/ranking'

const CATEGORY_EMPTY_MESSAGES: Record<RankingCategoryKey, string> = {
  xp: '산책을 완료하고 XP를 획득해 보세요.',
  distance: '산책 거리를 기록해 보세요.',
  duration: '산책을 완료하면 산책 시간이 반영돼요.',
  territory: '새로운 영토를 점령해 보세요.',
}

interface MyRankingCardProps {
  categoryRanking: MyCategoryRanking | undefined
  selectedCategory: RankingCategoryKey
  isLoading: boolean
  isError: boolean
  onRetry: () => void
}

export default function MyRankingCard({
  categoryRanking,
  selectedCategory,
  isLoading,
  isError,
  onRetry,
}: MyRankingCardProps) {
  return (
    <div className="border-t border-navy-15 bg-cream px-4 py-3">
      {isLoading && (
        <div className="flex items-center justify-center py-1">
          <div className="w-4 h-4 rounded-full border-2 border-navy-15 border-t-navy animate-spin" />
        </div>
      )}

      {!isLoading && isError && (
        <div className="flex items-center justify-between">
          <span className="text-f12 text-navy-40">내 순위를 불러오지 못했어요.</span>
          <button
            onClick={onRetry}
            className="text-f12 text-navy underline active:opacity-70 transition-opacity"
          >
            다시 시도
          </button>
        </div>
      )}

      {!isLoading && !isError && !categoryRanking && (
        <p className="text-f12 text-navy-40 text-center py-0.5">
          강아지를 등록하면 내 순위를 볼 수 있어요.
        </p>
      )}

      {!isLoading && !isError && categoryRanking && categoryRanking.rank === null && (
        <p className="text-f12 text-navy-40 text-center py-0.5">
          {CATEGORY_EMPTY_MESSAGES[selectedCategory]}
        </p>
      )}

      {!isLoading && !isError && categoryRanking && categoryRanking.rank !== null && (
        <div className="flex items-center justify-between">
          <div>
            <span className="text-f12 text-navy-40">내 순위</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-f18 font-bold text-navy">{categoryRanking.rank}위</span>
              {categoryRanking.percentile !== null && (
                <span className="text-f12 text-navy-40">상위 {categoryRanking.percentile}%</span>
              )}
            </div>
          </div>
          <span className="text-f14 font-semibold text-navy">
            {formatRankingValue(categoryRanking.value, categoryRanking.unit)}
          </span>
        </div>
      )}
    </div>
  )
}
