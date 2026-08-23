import { motion, useReducedMotion } from 'framer-motion'
import type { ConfirmAction, CrewMember } from '../../types/crew'

interface Props {
  action: ConfirmAction
  isMutating: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function CrewConfirmSheet({ action, isMutating, onConfirm, onCancel }: Props) {
  const prefersReducedMotion = useReducedMotion()
  const config = {
    leave: {
      title: '크루를 탈퇴할까요?',
      desc: '탈퇴하면 크루 멤버 자격이 사라집니다.',
      confirmLabel: '탈퇴하기',
      isDanger: true,
    },
    disband: {
      title: '크루를 해산할까요?',
      desc: '해산하면 모든 멤버가 크루에서 제거됩니다.',
      confirmLabel: '해산하기',
      isDanger: true,
    },
    kick: {
      title: `${(action as { type: 'kick'; member: CrewMember }).member?.nickname}님을 강퇴할까요?`,
      desc: '강퇴된 멤버는 크루에서 제거됩니다.',
      confirmLabel: '강퇴하기',
      isDanger: true,
    },
    transfer: {
      title: `${(action as { type: 'transfer'; member: CrewMember }).member?.nickname}님에게 리더를 위임할까요?`,
      desc: '위임 후 나는 일반 멤버가 됩니다.',
      confirmLabel: '위임하기',
      isDanger: false,
    },
  }[action.type]

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={(e) => { if (e.target === e.currentTarget && !isMutating) onCancel() }}
    >
      <motion.div
        className="w-full max-w-md bg-cream rounded-t-2xl px-6 pt-6 pb-10"
        initial={prefersReducedMotion ? false : { y: '100%' }}
        animate={{ y: 0 }}
        transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
      >
        <div className="w-10 h-1 rounded-full bg-navy-15 mx-auto mb-4" />
        <p className="text-f20 font-semibold text-navy mb-1">{config.title}</p>
        <p className="text-f14 text-navy-70 mb-6">{config.desc}</p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            disabled={isMutating}
            className={[
              'w-full py-4 rounded-pill text-f16 font-medium disabled:opacity-40 active:opacity-70 transition-opacity',
              config.isDanger ? 'bg-err text-white' : 'bg-navy text-cream',
            ].join(' ')}
          >
            {isMutating ? '처리 중...' : config.confirmLabel}
          </button>
          <button
            onClick={onCancel}
            disabled={isMutating}
            className="w-full py-3 rounded-pill bg-navy-8 text-navy-70 text-f14 font-medium disabled:opacity-40 active:opacity-70 transition-opacity"
          >
            취소
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
