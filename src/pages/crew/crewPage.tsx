import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useCrewManagement } from '../../hooks/useCrewManagement'
import BottomNav from '../../components/layout/bottomNav'
import CrewCreateModal from '../../components/crew/crewCreateModal'
import CrewJoinModal from '../../components/crew/crewJoinModal'
import CrewMemberList from '../../components/crew/crewMemberList'
import CrewInfoCard from '../../components/crew/crewInfoCard'
import CrewContributionCard from '../../components/crew/crewContributionCard'
import { ROUTES } from '../../constants/routes'
import type { CrewResponse } from '../../types/crew'

export default function CrewPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const { crew, members, pageState, fetchError, loadCrew, applyNewCrew } = useCrewManagement()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)

  function handleCreateSuccess(newCrew: CrewResponse) {
    setShowCreateModal(false)
    applyNewCrew(newCrew)
  }

  function handleJoinSuccess(joinedCrew: CrewResponse) {
    setShowJoinModal(false)
    applyNewCrew(joinedCrew)
  }

  if (pageState === 'loading') {
    return (
      <div className="flex flex-col h-full bg-cream">
        <PageHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-navy-15 border-t-navy animate-spin" />
        </div>
        <BottomNav />
      </div>
    )
  }

  if (pageState === 'error') {
    return (
      <div className="flex flex-col h-full bg-cream">
        <PageHeader />
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-4">
          <p className="text-f16 text-navy-70 text-center">
            {fetchError ?? '크루 정보를 불러오지 못했어요.'}
          </p>
          <button
            onClick={loadCrew}
            className="py-2 px-5 rounded-pill bg-navy-8 text-navy text-f14 font-medium active:opacity-70"
          >
            다시 시도
          </button>
        </div>
        <BottomNav />
      </div>
    )
  }

  if (pageState === 'notJoined') {
    return (
      <div className="flex flex-col h-full bg-cream">
        <PageHeader />
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
          <div className="text-center space-y-2">
            <p className="text-f20 font-semibold text-navy">크루가 없어요</p>
            <p className="text-f14 text-navy-70">크루를 만들거나 초대 코드로 가입해보세요.</p>
          </div>
          <div className="w-full space-y-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full py-4 rounded-pill bg-navy text-cream text-f16 font-medium active:opacity-70 transition-opacity"
            >
              크루 만들기
            </button>
            <button
              onClick={() => setShowJoinModal(true)}
              className="w-full py-4 rounded-pill bg-navy-8 text-navy text-f16 font-medium active:opacity-70 transition-opacity"
            >
              초대 코드로 가입
            </button>
          </div>
        </div>
        <BottomNav />

        {showCreateModal && (
          <CrewCreateModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={handleCreateSuccess}
          />
        )}
        {showJoinModal && (
          <CrewJoinModal onClose={() => setShowJoinModal(false)} onSuccess={handleJoinSuccess} />
        )}
      </div>
    )
  }

  if (!crew) return null

  return (
    <div className="flex flex-col h-full bg-cream">
      <PageHeader />

      <div className="flex-1 overflow-y-auto px-6 pb-24 space-y-5">
        <CrewInfoCard crew={crew} />

        <CrewContributionCard
          key={crew.id}
          crewId={crew.id}
          member={user ? members.find((member) => member.userId === user.id) : undefined}
        />

        <button
          onClick={() => navigate(ROUTES.CREW.TERRITORY)}
          className="w-full py-3.5 rounded-xl bg-navy-5 text-navy text-f15 font-medium text-left px-5 flex items-center justify-between active:opacity-70 transition-opacity"
        >
          <span>크루 영토 보기</span>
          <span className="text-navy-70" aria-hidden="true">
            ›
          </span>
        </button>

        <CrewMemberList members={members} myUserId={user?.id} myRole={crew.myRole} />
      </div>

      <BottomNav />
    </div>
  )
}

function PageHeader() {
  return (
    <div className="flex items-center px-6 pt-14 pb-6">
      <h1 className="text-f20 font-semibold text-navy">크루</h1>
    </div>
  )
}
