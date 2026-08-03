import type { RankingCategoryKey } from '../../types/ranking'

const RANKING_CATEGORIES: RankingCategoryKey[] = ['xp', 'distance', 'duration', 'territory']

const CATEGORY_LABELS: Record<RankingCategoryKey, string> = {
  xp: 'XP',
  distance: '거리',
  duration: '시간',
  territory: '영토',
}

interface RankingCategoryTabsProps {
  selectedCategory: RankingCategoryKey
  onSelect: (category: RankingCategoryKey) => void
}

export default function RankingCategoryTabs({ selectedCategory, onSelect }: RankingCategoryTabsProps) {
  return (
    <div className="flex border-b border-navy-15 bg-cream">
      {RANKING_CATEGORIES.map((cat) => {
        const isActive = cat === selectedCategory
        return (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={`flex-1 py-3 text-f13 font-medium transition-colors active:opacity-70 ${
              isActive ? 'text-navy border-b-2 border-navy' : 'text-navy-40'
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        )
      })}
    </div>
  )
}
