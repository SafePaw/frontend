import type { RankingCategoryKey } from '../../types/ranking'

const CATEGORIES: { key: RankingCategoryKey; label: string }[] = [
  { key: 'territory', label: '영토' },
  { key: 'xp', label: 'XP' },
  { key: 'distance', label: '거리' },
  { key: 'duration', label: '시간' },
]

interface MetricChipGroupProps {
  selectedCategory: RankingCategoryKey
  onSelect: (category: RankingCategoryKey) => void
}

export default function MetricChipGroup({ selectedCategory, onSelect }: MetricChipGroupProps) {
  return (
    <div
      role="tablist"
      aria-label="랭킹 기준 선택"
      className="flex gap-2 px-4 py-2 overflow-x-auto"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {CATEGORIES.map(({ key, label }) => {
        const isActive = key === selectedCategory
        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(key)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-f12 font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-1 active:opacity-70 ${
              isActive ? 'bg-navy text-cream' : 'bg-navy-8 text-navy-70 hover:bg-navy-15'
            }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
