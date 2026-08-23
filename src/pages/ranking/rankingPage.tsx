import { useState, useEffect, useRef } from 'react'
import { useIndividualRanking } from '../../hooks/ranking/useIndividualRanking'
import { useCrewRanking } from '../../hooks/ranking/useCrewRanking'
import MetricChipGroup from '../../components/ranking/metricChipGroup'
import RankingInfoCard from '../../components/ranking/rankingInfoCard'
import MyRankingFloating from '../../components/ranking/myRankingFloating'
import MyCrewRankingFloating from '../../components/ranking/myCrewRankingFloating'
import IndividualRankingSection from '../../components/ranking/individualRankingSection'
import CrewRankingSection from '../../components/ranking/crewRankingSection'
import BottomNav from '../../components/layout/bottomNav'

type RankingMode = 'individual' | 'crew'

export default function RankingPage() {
  const [rankingMode, setRankingMode] = useState<RankingMode>('individual')
  const [infoCardVisible, setInfoCardVisible] = useState(true)
  const contentRef = useRef<HTMLDivElement>(null)

  const individual = useIndividualRanking(contentRef)
  const crew = useCrewRanking(rankingMode === 'crew', contentRef)

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [individual.selectedCategory, individual.currentPage, rankingMode, crew.crewPage])

  function handleModeChange(mode: RankingMode) {
    if (mode === rankingMode) return
    setRankingMode(mode)
    contentRef.current?.scrollTo({ top: 0 })
  }

  return (
    <div className="flex flex-col h-full bg-cream">
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h1 className="text-f20 font-bold text-navy">랭킹</h1>
          <div className="flex gap-1 bg-navy-8 rounded-full p-1">
            <button
              type="button"
              onClick={() => handleModeChange('individual')}
              className={`px-3 py-1 rounded-full text-f12 font-medium transition-colors focus-visible:outline-none ${
                rankingMode === 'individual' ? 'bg-navy text-cream' : 'text-navy-70'
              }`}
            >
              개인
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('crew')}
              className={`px-3 py-1 rounded-full text-f12 font-medium transition-colors focus-visible:outline-none ${
                rankingMode === 'crew' ? 'bg-navy text-cream' : 'text-navy-70'
              }`}
            >
              크루
            </button>
          </div>
        </div>

        {rankingMode === 'individual' && (
          <>
            <MetricChipGroup
              selectedCategory={individual.selectedCategory}
              onSelect={individual.handleCategorySelect}
            />
            {infoCardVisible && <RankingInfoCard onDismiss={() => setInfoCardVisible(false)} />}
          </>
        )}
      </div>

      <div ref={contentRef} className="flex-1 overflow-y-auto pb-24">
        {rankingMode === 'individual' && (
          <IndividualRankingSection
            fetchState={individual.fetchState}
            currentPage={individual.currentPage}
            podiumItems={individual.podiumItems}
            listItems={individual.listItems}
            totalPages={individual.totalPages}
            myDogId={individual.myRanking?.dogId ?? null}
            myRowRef={individual.myRowRefCallback}
            onPageChange={individual.handlePageChange}
            onRetry={individual.handleRetry}
          />
        )}

        {rankingMode === 'crew' && (
          <CrewRankingSection
            fetchState={crew.crewFetchState}
            crewPage={crew.crewPage}
            podiumItems={crew.crewPodiumItems}
            listItems={crew.crewListItems}
            totalPages={crew.crewTotalPages}
            myCrewRanking={crew.myCrewRanking}
            myCrewRowRef={crew.myCrewRowRefCallback}
            onPageChange={crew.handleCrewPageChange}
            onRetry={crew.handleCrewRetry}
          />
        )}
      </div>

      {rankingMode === 'individual' && individual.currentMyRanking && (
        <MyRankingFloating
          categoryRanking={individual.currentMyRanking}
          visible={individual.showFloating}
          onNavigate={individual.handleNavigateToMyRank}
        />
      )}

      {rankingMode === 'crew' && crew.myCrewRanking && (
        <MyCrewRankingFloating
          myCrewRanking={crew.myCrewRanking}
          visible={crew.showCrewFloating}
          onNavigate={crew.handleNavigateToMyCrewRank}
        />
      )}

      <BottomNav />
    </div>
  )
}
