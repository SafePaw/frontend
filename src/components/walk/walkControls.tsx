import flagImg from '../../assets/flag.png'
import type { WalkServerStatus, WalkPendingAction } from '../../types/walk'

interface WalkControlsProps {
  serverStatus: WalkServerStatus | null
  pendingAction: WalkPendingAction | null
  onPause: () => void
  onResume: () => void
  onFinish: () => void
}

export default function WalkControls({
  serverStatus,
  pendingAction,
  onPause,
  onResume,
  onFinish,
}: WalkControlsProps) {
  const busy = pendingAction !== null
  const isPaused = serverStatus === 'PAUSED'

  if (isPaused) {
    return (
      <div className="flex gap-3 px-6 py-4">
        <button
          onClick={onResume}
          disabled={busy}
          aria-label="산책 재개"
          className="flex-[11] py-3 rounded-sm bg-navy text-white text-f16 font-medium active:opacity-70 transition-opacity disabled:opacity-40"
        >
          {pendingAction === 'resume' ? '재개 중...' : '▶ 재개하기'}
        </button>
        <button
          onClick={onFinish}
          disabled={busy}
          aria-label="산책 종료"
          className="flex-[10] py-3 rounded-sm bg-navy-8 text-navy-70 text-f16 font-medium border border-navy-15 active:opacity-70 transition-opacity disabled:opacity-40 flex items-center justify-center gap-1.5"
        >
          <img src={flagImg} className="w-5 h-5" alt="" />
          종료
        </button>
      </div>
    )
  }

  return (
    <div className="flex gap-3 px-6 py-4">
      <button
        onClick={onPause}
        disabled={busy}
        aria-label="산책 일시정지"
        className="flex-[10] py-3 rounded-sm bg-navy-8 text-navy-70 text-f16 font-medium active:opacity-70 transition-opacity disabled:opacity-40"
      >
        {pendingAction === 'pause' ? '정지 중...' : '⏸ 일시정지'}
      </button>
      <button
        onClick={onFinish}
        disabled={busy}
        aria-label="산책 종료"
        className="flex-[11] py-3 rounded-sm bg-navy text-white text-f16 font-medium active:opacity-70 transition-opacity disabled:opacity-40 flex items-center justify-center gap-1.5"
      >
        <img src={flagImg} className="w-5 h-5" alt="" />
        {pendingAction === 'finish' ? '종료 중...' : '산책 종료'}
      </button>
    </div>
  )
}
