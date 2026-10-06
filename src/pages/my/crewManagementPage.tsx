import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { useAuthStore } from '../../stores/authStore'
import { useCrewManagement } from '../../hooks/useCrewManagement'
import BottomNav from '../../components/layout/bottomNav'
import Button from '../../components/ui/button'
import CrewInfoCard from '../../components/crew/crewInfoCard'
import CrewMemberList from '../../components/crew/crewMemberList'
import CrewEditModal from '../../components/crew/crewEditModal'
import CrewConfirmSheet from '../../components/crew/crewConfirmSheet'
import type { ConfirmAction } from '../../types/crew'

export default function CrewManagementPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const {
    crew,
    members,
    pageState,
    fetchError,
    mutateError,
    isMutating,
    inlineMessage,
    loadCrew,
    applyEditedCrew,
    rotateInviteCode,
    leave,
    disband,
    kick,
    transfer,
  } = useCrewManagement()
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const isLeader = crew?.myRole === 'LEADER'

  function handleBack() {
    if (location.state?.fromMy) navigate(-1)
    else navigate(ROUTES.MY.INDEX, { replace: true })
  }

  async function handleConfirm() {
    if (!confirmAction || isMutating) return
    const action = confirmAction
    // Recheck the current role before executing an action from an open sheet.
    if (action.type === 'leave' ? crew?.myRole !== 'MEMBER' : !isLeader) {
      setConfirmAction(null)
      return
    }
    let shouldReturnToMy = false
    if (action.type === 'leave') shouldReturnToMy = await leave()
    else if (action.type === 'disband') shouldReturnToMy = await disband()
    else if (action.type === 'rotateInviteCode') await rotateInviteCode()
    else if (action.type === 'kick') await kick(action.member)
    else if (action.type === 'transfer') await transfer(action.member)
    setConfirmAction(null)
    if (shouldReturnToMy) {
      // Replace the management entry so Back cannot reopen a departed crew.
      navigate(ROUTES.MY.INDEX, { replace: true })
    }
  }

  return (
    <div className="flex flex-col h-full bg-cream">
      <div className="flex items-center px-6 pt-14 pb-6">
        <button
          onClick={handleBack}
          className="mr-3 text-f20 text-navy-70 leading-none"
          aria-label="뒤로가기"
        >
          ←
        </button>
        <h1 className="text-f20 font-semibold text-navy">크루 관리</h1>
      </div>

      {pageState === 'loading' && (
        <div
          className="flex-1 flex items-center justify-center"
          role="status"
          aria-label="크루 정보 로딩"
        >
          <div className="w-8 h-8 rounded-full border-2 border-navy-15 border-t-navy animate-spin" />
        </div>
      )}
      {pageState === 'error' && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-4">
          <p className="text-f16 text-navy-70 text-center">{fetchError}</p>
          <Button variant="ghost" onClick={loadCrew}>
            다시 시도
          </Button>
        </div>
      )}
      {pageState === 'notJoined' && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-4">
          <p className="text-f20 font-semibold text-navy">관리할 크루가 없어요</p>
          <p className="text-f16 text-navy-70 text-center">
            크루 탭에서 크루를 만들거나 가입할 수 있어요.
          </p>
          <Button variant="ghost" onClick={handleBack}>
            마이페이지로 돌아가기
          </Button>
        </div>
      )}
      {pageState === 'joined' && crew && (
        <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-6 space-y-5">
          <CrewInfoCard
            crew={crew}
            isMutating={isMutating}
            inlineMessage={inlineMessage}
            onRotateInviteCode={
              isLeader ? () => setConfirmAction({ type: 'rotateInviteCode' }) : undefined
            }
          />
          {mutateError && (
            <p role="alert" className="text-f12 text-err">
              {mutateError}
            </p>
          )}
          <CrewMemberList
            members={members}
            myUserId={user?.id}
            myRole={crew.myRole}
            isMutating={isMutating}
            onKick={
              isLeader && user ? (member) => setConfirmAction({ type: 'kick', member }) : undefined
            }
            onTransfer={
              isLeader && user
                ? (member) => setConfirmAction({ type: 'transfer', member })
                : undefined
            }
          />
          {isLeader && (
            <div className="space-y-3">
              <div className="bg-navy-5 rounded-xl overflow-hidden divide-y divide-navy-8">
                <button
                  onClick={() => setShowEditModal(true)}
                  disabled={isMutating}
                  className="w-full px-5 py-4 text-left text-f16 text-navy flex items-center justify-between disabled:opacity-40 active:opacity-70"
                >
                  <span>크루 정보 수정</span>
                  <span aria-hidden="true">›</span>
                </button>
                <button
                  onClick={() => setConfirmAction({ type: 'disband' })}
                  disabled={isMutating}
                  className="w-full px-5 py-4 text-left text-f16 text-err disabled:opacity-40 active:opacity-70"
                >
                  크루 해산
                </button>
              </div>
              <p className="text-f12 text-navy-70">
                리더는 다른 멤버에게 리더를 위임한 뒤 크루를 나갈 수 있어요. 혼자 남은 경우에는
                크루를 해산할 수 있어요.
              </p>
            </div>
          )}
          {crew.myRole === 'MEMBER' && (
            <button
              onClick={() => setConfirmAction({ type: 'leave' })}
              disabled={isMutating}
              className="w-full bg-navy-5 rounded-xl px-5 py-4 text-left text-f16 text-err disabled:opacity-40 active:opacity-70"
            >
              크루 나가기
            </button>
          )}
        </div>
      )}
      <BottomNav />
      {showEditModal && crew && isLeader && (
        <CrewEditModal
          crew={crew}
          onClose={() => setShowEditModal(false)}
          onSuccess={(updated) => {
            applyEditedCrew(updated)
            setShowEditModal(false)
          }}
        />
      )}
      {confirmAction && (
        <CrewConfirmSheet
          action={confirmAction}
          isMutating={isMutating}
          onConfirm={handleConfirm}
          onCancel={() => {
            if (!isMutating) setConfirmAction(null)
          }}
        />
      )}
    </div>
  )
}
