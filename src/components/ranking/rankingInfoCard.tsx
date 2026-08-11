interface RankingInfoCardProps {
  onDismiss: () => void
}

export default function RankingInfoCard({ onDismiss }: RankingInfoCardProps) {
  return (
    <div className="mx-4 mb-3 rounded-lg bg-navy-5 border border-navy-15 px-4 py-3 flex gap-3 items-start">
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="currentColor"
        className="flex-shrink-0 mt-0.5 text-navy-40"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-3a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-1 4a1 1 0 0 1 1-1h.5a.5.5 0 0 1 .5.5V11a1 1 0 1 1-2 0V9z"
        />
      </svg>
      <div className="flex-1 min-w-0">
        <p className="text-f12 font-semibold text-navy">최근 3개월 랭킹</p>
        <p className="text-f12 text-navy-70 mt-0.5 leading-relaxed">
          최근 3개월간의 산책 기록을 기준으로 집계됩니다. <br /> 오래된 기록은 매일 순차적으로
          제외됩니다.
        </p>
      </div>
      <button
        type="button"
        aria-label="안내 닫기"
        onClick={onDismiss}
        className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded text-navy-40 hover:text-navy hover:bg-navy-8 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <line
            x1="1"
            y1="1"
            x2="9"
            y2="9"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="9"
            y1="1"
            x2="1"
            y2="9"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  )
}
