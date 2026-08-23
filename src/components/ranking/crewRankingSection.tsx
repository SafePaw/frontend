import type { RefCallback } from 'react'
import CrewRankingPodium from './crewRankingPodium'
import CrewRankingItem from './crewRankingItem'
import RankingPagination from './rankingPagination'
import RankingSkeleton from './rankingSkeleton'
import type { CrewRankingEntry, MyCrewRanking } from '../../types/crewTerritory'

interface CrewRankingSectionProps {
  fetchState: 'loading' | 'success' | 'error'
  crewPage: number
  podiumItems: CrewRankingEntry[]
  listItems: CrewRankingEntry[]
  totalPages: number
  myCrewRanking: MyCrewRanking | null
  myCrewRowRef: RefCallback<HTMLDivElement>
  onPageChange: (page: number) => void
  onRetry: () => void
}

export default function CrewRankingSection({
  fetchState,
  crewPage,
  podiumItems,
  listItems,
  totalPages,
  myCrewRanking,
  myCrewRowRef,
  onPageChange,
  onRetry,
}: CrewRankingSectionProps) {
  if (fetchState === 'loading') {
    return <RankingSkeleton showPodium={crewPage === 0} />
  }

  if (fetchState === 'error') {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 px-6">
        <p className="text-f16 text-navy text-center">
          크루 랭킹을 불러오지 못했습니다.
          <br />
          잠시 후 다시 시도해 주세요.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="px-6 py-2.5 rounded-pill bg-navy text-cream text-f12 font-medium active:opacity-70 transition-opacity focus-visible:outline-none"
        >
          다시 시도
        </button>
      </div>
    )
  }

  if (listItems.length === 0 && podiumItems.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 px-6">
        <p className="text-f16 text-navy-70 text-center">아직 크루 랭킹 데이터가 없습니다.</p>
      </div>
    )
  }

  return (
    <>
      {podiumItems.length > 0 && <CrewRankingPodium items={podiumItems} />}
      <div>
        {listItems.map((item) => (
          <CrewRankingItem
            key={item.crewId}
            item={item}
            isMyCrew={myCrewRanking?.crewId === item.crewId}
            innerRef={myCrewRanking?.crewId === item.crewId ? myCrewRowRef : undefined}
          />
        ))}
      </div>
      <RankingPagination currentPage={crewPage} totalPages={totalPages} onPageChange={onPageChange} />
    </>
  )
}
