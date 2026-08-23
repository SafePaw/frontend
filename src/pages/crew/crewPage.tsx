import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useCrewManagement } from '../../hooks/useCrewManagement'
import BottomNav from '../../components/layout/bottomNav'
import CrewCreateModal from '../../components/crew/crewCreateModal'
import CrewJoinModal from '../../components/crew/crewJoinModal'
import CrewEditModal from '../../components/crew/crewEditModal'
import CrewMemberList from '../../components/crew/crewMemberList'
import CrewInfoCard from '../../components/crew/crewInfoCard'
import CrewConfirmSheet from '../../components/crew/crewConfirmSheet'
import { ROUTES } from '../../constants/routes'
import type { ConfirmAction, CrewResponse } from '../../types/crew'

export default function CrewPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const {
    crew,
    members,
    pageState,
    fetchError,
    mutateError,
    isMutating,
    inlineMessage,
    loadCrew,
    applyNewCrew,
    applyEditedCrew,
    rotateInviteCode,
    leave,
    disband,
    kick,
    transfer,
  } = useCrewManagement()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null)

  function handleCreateSuccess(newCrew: CrewResponse) {
    setShowCreateModal(false)
    applyNewCrew(newCrew)
  }

  function handleJoinSuccess(joinedCrew: CrewResponse) {
    setShowJoinModal(false)
    applyNewCrew(joinedCrew)
  }

  function handleEditSuccess(updatedCrew: CrewResponse) {
    setShowEditModal(false)
    applyEditedCrew(updatedCrew)
  }

  async function handleConfirm() {
    if (!confirmAction) return
    const action = confirmAction
    setConfirmAction(null)

    if (action.type === 'leave') await leave()
    else if (action.type === 'disband') await disband()
    else if (action.type === 'kick') await kick(action.member)
    else if (action.type === 'transfer') await transfer(action.member)
  }

  if (pageState === 'loading') {
    return (
      <div className="flex flex-col h-full bg-cream">
        <PageHeader onBack={() => navigate(-1)} />
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
        <PageHeader onBack={() => navigate(-1)} />
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
        <PageHeader onBack={() => navigate(-1)} />
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
          <div className="text-center space-y-2">
            <p className="text-f20 font-semibold text-navy">크루가 없어요</p>
            <p className="text-f14 text-navy-70">
              크루를 만들거나 초대 코드로 가입해보세요.
            </p>
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
          <CrewJoinModal
            onClose={() => setShowJoinModal(false)}
            onSuccess={handleJoinSuccess}
          />
        )}
      </div>
    )
  }

  // joined
  if (!crew || !user) return null

  const isLeader = crew.myRole === 'LEADER'
  const isMember = crew.myRole === 'MEMBER'

  return (
    <div className="flex flex-col h-full bg-cream">
      <PageHeader onBack={() => navigate(-1)} />

      <div className="flex-1 overflow-y-auto px-6 pb-24 space-y-5">
        <CrewInfoCard
          crew={crew}
          isMutating={isMutating}
          inlineMessage={inlineMessage}
          onRotateInviteCode={rotateInviteCode}
        />

        <button
          onClick={() => navigate(ROUTES.CREW.TERRITORY)}
          className="w-full py-3.5 rounded-xl bg-navy-5 text-navy text-f15 font-medium text-left px-5 flex items-center justify-between active:opacity-70 transition-opacity"
        >
          <span>크루 영토 보기</span>
          <span className="text-navy-70" aria-hidden="true">›</span>
        </button>

        {mutateError && (
          <p className="text-f12 text-err text-center">{mutateError}</p>
        )}

        <CrewMemberList
          members={members}
          myUserId={user.id}
          myRole={crew.myRole ?? 'MEMBER'}
          isMutating={isMutating}
          onKick={(member) => setConfirmAction({ type: 'kick', member })}
          onTransfer={(member) => setConfirmAction({ type: 'transfer', member })}
        />

        <div className="space-y-1.5">
          {isLeader && (
            <div className="bg-navy-5 rounded-xl overflow-hidden divide-y divide-navy-8">
              <button
                onClick={() => setShowEditModal(true)}
                className="w-full px-5 py-4 text-left text-f16 text-navy flex items-center justify-between active:opacity-70 transition-opacity"
              >
                <span>크루 정보 수정</span>
                <span className="text-navy-70" aria-hidden="true">›</span>
              </button>
              <button
                onClick={() => setConfirmAction({ type: 'disband' })}
                disabled={isMutating}
                className="w-full px-5 py-4 text-left text-f16 text-err flex items-center justify-between disabled:opacity-40 active:opacity-70 transition-opacity"
              >
                크루 해산
              </button>
            </div>
          )}

          {isMember && (
            <div className="bg-navy-5 rounded-xl overflow-hidden">
              <button
                onClick={() => setConfirmAction({ type: 'leave' })}
                disabled={isMutating}
                className="w-full px-5 py-4 text-left text-f16 text-err flex items-center disabled:opacity-40 active:opacity-70 transition-opacity"
              >
                크루 탈퇴
              </button>
            </div>
          )}
        </div>
      </div>

      <BottomNav />

      {showEditModal && crew && (
        <CrewEditModal
          crew={crew}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
        />
      )}

      {confirmAction && (
        <CrewConfirmSheet
          action={confirmAction}
          isMutating={isMutating}
          onConfirm={handleConfirm}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  )
}

function PageHeader({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex items-center px-6 pt-14 pb-6">
      <button
        onClick={onBack}
        className="mr-3 text-f20 text-navy-70 leading-none"
        aria-label="뒤로가기"
      >
        ←
      </button>
      <h1 className="text-f20 font-semibold text-navy">크루</h1>
    </div>
  )
}
