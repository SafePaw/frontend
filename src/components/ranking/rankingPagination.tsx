interface RankingPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function RankingPagination({
  currentPage,
  totalPages,
  onPageChange,
}: RankingPaginationProps) {
  if (totalPages <= 1) return null

  const isFirst = currentPage === 0
  const isLast = currentPage === totalPages - 1

  return (
    <div className="flex items-center justify-center gap-6 py-4 px-4">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={isFirst}
        aria-label="이전 페이지"
        className="px-4 py-2 text-f12 font-medium rounded-lg bg-navy-8 text-navy transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy active:opacity-70 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-navy-15"
      >
        이전
      </button>

      <span
        className="text-f12 text-navy-70 tabular-nums min-w-[4rem] text-center"
        aria-live="polite"
        aria-label={`${currentPage + 1}페이지, 총 ${totalPages}페이지`}
      >
        {currentPage + 1} / {totalPages}
      </span>

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={isLast}
        aria-label="다음 페이지"
        className="px-4 py-2 text-f12 font-medium rounded-lg bg-navy-8 text-navy transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy active:opacity-70 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-navy-15"
      >
        다음
      </button>
    </div>
  )
}
