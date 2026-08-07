interface RankingSkeletonProps {
  showPodium?: boolean
}

export default function RankingSkeleton({ showPodium = true }: RankingSkeletonProps) {
  return (
    <div className="animate-pulse">
      {showPodium && (
        <div className="flex items-end gap-2 px-4 pt-4">
          <div className="flex flex-col items-center gap-1.5 flex-1">
            <div className="w-12 h-12 rounded-full bg-navy-15" />
            <div className="h-3 w-14 rounded bg-navy-15" />
            <div className="h-2 w-10 rounded bg-navy-8" />
            <div className="h-12 w-full rounded-t-md bg-navy-15" />
          </div>
          <div className="flex flex-col items-center gap-1.5 flex-1">
            <div className="w-4 h-4 rounded-full bg-navy-15" />
            <div className="w-14 h-14 rounded-full bg-navy-15" />
            <div className="h-3 w-16 rounded bg-navy-15" />
            <div className="h-2 w-12 rounded bg-navy-8" />
            <div className="h-20 w-full rounded-t-md bg-navy-15" />
          </div>
          <div className="flex flex-col items-center gap-1.5 flex-1">
            <div className="w-12 h-12 rounded-full bg-navy-15" />
            <div className="h-3 w-14 rounded bg-navy-15" />
            <div className="h-2 w-10 rounded bg-navy-8" />
            <div className="h-8 w-full rounded-t-md bg-navy-15" />
          </div>
        </div>
      )}
      <div className="mt-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-navy-8">
            <div className="w-6 h-4 rounded bg-navy-15 flex-shrink-0" />
            <div className="w-10 h-10 rounded-full bg-navy-15 flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-24 rounded bg-navy-15" />
              <div className="h-2 w-16 rounded bg-navy-8" />
            </div>
            <div className="h-3 w-14 rounded bg-navy-15 flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}
