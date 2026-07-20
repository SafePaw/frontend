interface WalkErrorBannerProps {
  message: string | null
  onDismiss?: () => void
}

export default function WalkErrorBanner({ message, onDismiss }: WalkErrorBannerProps) {
  if (!message) return null

  return (
    <div
      role="alert"
      className="mx-4 mb-2 px-4 py-3 rounded-lg bg-err/10 border border-err/20 flex items-start justify-between gap-3"
    >
      <p className="text-f12 text-err flex-1">{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="오류 닫기"
          className="text-err text-f12 leading-none flex-shrink-0"
        >
          ✕
        </button>
      )}
    </div>
  )
}
