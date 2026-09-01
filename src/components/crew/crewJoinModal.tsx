import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { joinCrew } from '../../api/crews'
import { extractErrorCode } from '../../utils/apiError'
import type { CrewResponse } from '../../types/crew'

const ERROR_MESSAGES: Record<string, string> = {
  CREW_INVALID_INVITE: '초대 코드가 올바르지 않습니다.',
  CREW_ALREADY_JOINED: '이미 크루에 가입되어 있습니다.',
  CREW_MEMBER_LIMIT: '크루 인원이 가득 찼습니다.',
  CREW_NOT_FOUND: '크루를 찾을 수 없습니다.',
}

interface Props {
  onClose: () => void
  onSuccess: (crew: CrewResponse) => void
}

export default function CrewJoinModal({ onClose, onSuccess }: Props) {
  const prefersReducedMotion = useReducedMotion()
  const [inviteCode, setInviteCode] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const trimmed = inviteCode.trim().toUpperCase()
  const isValid = /^[A-Za-z0-9]{8}$/.test(trimmed)

  async function handleJoin() {
    if (!isValid || isJoining) return
    setIsJoining(true)
    setError(null)
    try {
      const crew = await joinCrew({ inviteCode: trimmed })
      onSuccess(crew)
    } catch (err) {
      const code = extractErrorCode(err)
      setError(ERROR_MESSAGES[code] ?? '크루 가입에 실패했습니다.')
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isJoining) onClose()
      }}
    >
      <motion.div
        className="w-full max-w-md bg-cream rounded-t-2xl px-6 pt-6 pb-10"
        initial={prefersReducedMotion ? false : { y: '100%' }}
        animate={{ y: 0 }}
        transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
      >
        <h2 className="text-f18 font-semibold text-navy mb-1">크루 가입</h2>
        <p className="text-f14 text-navy-70 mb-5">초대 코드를 입력해 크루에 가입하세요.</p>

        <div className="space-y-3">
          <div className="flex items-center bg-navy-5 rounded-md focus-within:ring-2 focus-within:ring-navy-15">
            <input
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="초대 코드 8자리"
              maxLength={8}
              autoCapitalize="characters"
              className="flex-1 min-w-0 px-4 py-3 bg-transparent text-f16 text-navy placeholder:text-navy-70 outline-none tracking-widest uppercase"
              autoFocus
            />
            <button
              type="button"
              onClick={async () => {
                try {
                  const text = await navigator.clipboard.readText()
                  setInviteCode(text.trim().slice(0, 8))
                } catch {
                  //
                }
              }}
              className="flex items-center justify-center min-w-[44px] min-h-[44px] px-3 text-f13 text-navy-70 flex-shrink-0 active:opacity-60 transition-opacity"
              aria-label="클립보드에서 붙여넣기"
            >
              붙여넣기
            </button>
          </div>
          {error && <p className="text-f12 text-err">{error}</p>}

          <button
            onClick={handleJoin}
            disabled={!isValid || isJoining}
            className="w-full py-4 rounded-pill bg-navy text-cream text-f16 font-medium disabled:opacity-40 active:opacity-70 transition-opacity"
          >
            {isJoining ? '가입 중...' : '가입하기'}
          </button>
          <button
            onClick={onClose}
            disabled={isJoining}
            className="w-full py-3 text-f14 text-navy-70 disabled:opacity-40"
          >
            취소
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
