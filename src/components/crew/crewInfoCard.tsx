import { useState } from 'react'
import type { CrewResponse } from '../../types/crew'
import Toast from '../ui/toast'

interface Props {
  crew: CrewResponse
  isMutating: boolean
  inlineMessage: string | null
  onRotateInviteCode: () => void
}

export default function CrewInfoCard({
  crew,
  isMutating,
  inlineMessage,
  onRotateInviteCode,
}: Props) {
  const isLeader = crew.myRole === 'LEADER'
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    if (!crew.inviteCode || copied) return
    try {
      await navigator.clipboard.writeText(crew.inviteCode)
    } catch {
      const el = document.createElement('textarea')
      el.value = crew.inviteCode
      el.style.position = 'fixed'
      el.style.opacity = '0'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="bg-navy-8 rounded-xl px-5 py-5 border border-navy-15 shadow-sm">
      <div className="flex items-center gap-4">
        <CrewAvatar imageUrl={crew.imageUrl} name={crew.name} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-f20 font-semibold text-navy truncate">{crew.name}</p>
            <span
              className="inline-block w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: crew.territoryColor }}
              aria-hidden="true"
            />
          </div>
          <p className="text-f12 text-navy-70 mt-0.5">
            멤버 {crew.memberCount}/{crew.maxMembers}명
          </p>
          {isLeader && (
            <span className="inline-block mt-1 text-f10 text-cream bg-navy rounded-full px-2 py-0.5">
              리더
            </span>
          )}
        </div>
      </div>

      {crew.inviteCode && (
        <div className="mt-4 pt-4 border-t border-navy-15">
          <p className="text-f12 text-navy-70 mb-1">초대 코드</p>
          <div className="flex items-center justify-between gap-2">
            <span className="text-f16 font-semibold text-navy tracking-widest">
              {crew.inviteCode}
            </span>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={handleCopy}
                aria-label="초대 코드 복사"
                className="flex items-center justify-center min-w-[44px] min-h-[44px] text-navy-70 active:opacity-60 transition-opacity"
              >
                {copied ? <IconCheck /> : <IconCopy />}
              </button>
              {isLeader && (
                <button
                  onClick={onRotateInviteCode}
                  disabled={isMutating}
                  className="text-f12 text-navy-70 border border-navy-15 rounded-pill px-3 py-1 disabled:opacity-40 active:opacity-70 transition-opacity"
                >
                  재발급
                </button>
              )}
            </div>
          </div>
          {inlineMessage && <p className="text-f12 text-navy-70 mt-1">{inlineMessage}</p>}
        </div>
      )}

      <Toast message="✓ 초대 코드가 복사됐어요" visible={copied} />
    </div>
  )
}

function IconCopy() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function IconCheck() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-ok"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function CrewAvatar({ imageUrl, name }: { imageUrl: string | null; name: string }) {
  const [imgError, setImgError] = useState(false)

  if (imageUrl && !imgError) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className="w-14 h-14 rounded-full object-cover flex-shrink-0"
        onError={() => setImgError(true)}
      />
    )
  }

  return (
    <div className="w-14 h-14 rounded-full bg-navy-15 flex items-center justify-center flex-shrink-0">
      <span className="text-f18 font-semibold text-navy">{name.charAt(0)}</span>
    </div>
  )
}
