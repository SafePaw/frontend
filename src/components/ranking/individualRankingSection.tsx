import type { RefCallback } from 'react'
import RankingPodium from './rankingPodium'
import RankingList from './rankingList'
import RankingPagination from './rankingPagination'
import RankingSkeleton from './rankingSkeleton'
import type { RankingItem } from '../../types/ranking'

interface IndividualRankingSectionProps {
  fetchState: 'loading' | 'success' | 'error'
  currentPage: number
  podiumItems: RankingItem[]
  listItems: RankingItem[]
  totalPages: number
  myDogId: number | null
  myRowRef: RefCallback<HTMLDivElement>
  onPageChange: (page: number) => void
  onRetry: () => void
}

export default function IndividualRankingSection({
  fetchState,
  currentPage,
  podiumItems,
  listItems,
  totalPages,
  myDogId,
  myRowRef,
  onPageChange,
  onRetry,
}: IndividualRankingSectionProps) {
  if (fetchState === 'loading') {
    return <RankingSkeleton showPodium={currentPage === 0} />
  }

  if (fetchState === 'error') {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 px-6">
        <p className="text-f16 text-navy text-center">
          랭킹을 불러오지 못했습니다.
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
        <p className="text-f16 text-navy-70 text-center">아직 랭킹 데이터가 없습니다.</p>
      </div>
    )
  }

  return (
    <>
      {podiumItems.length > 0 && <RankingPodium items={podiumItems} />}
      <RankingList items={listItems} myDogId={myDogId} myRowRef={myRowRef} />
      <RankingPagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
    </>
  )
}
