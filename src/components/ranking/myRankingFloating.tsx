import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { formatRankingValue } from '../../utils/rankingFormat'
import type { MyCategoryRanking } from '../../types/ranking'

interface MyRankingFloatingProps {
  categoryRanking: MyCategoryRanking
  visible: boolean
  onNavigate: () => void
}

export default function MyRankingFloating({
  categoryRanking,
  visible,
  onNavigate,
}: MyRankingFloatingProps) {
  const prefersReducedMotion = useReducedMotion()

  if (categoryRanking.rank === null) return null

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={prefersReducedMotion ? false : { x: 80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={prefersReducedMotion ? {} : { x: 80, opacity: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="fixed right-4 w-80"
          style={{
            bottom: 'calc(var(--bottom-nav-height, 64px) + 8px + env(safe-area-inset-bottom, 0px))',
            zIndex: 40,
          }}
        >
          <button
            type="button"
            onClick={onNavigate}
            aria-label={`내 순위 ${categoryRanking.rank}위 보기`}
            className="w-full bg-navy text-cream rounded-xl px-4 py-3 flex items-center justify-between border border-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream active:opacity-90 active:translate-y-0.5 transition-all duration-150"
            style={{
              boxShadow:
                '0 2px 0 rgba(255,255,255,0.10) inset, 0 6px 12px rgba(0,0,0,0.30), 0 16px 32px rgba(0,0,0,0.20), 0 32px 56px rgba(0,0,0,0.10)',
            }}
          >
            <div className="text-left">
              <p className="text-f12 text-navy-70" style={{ color: 'rgba(242,230,177,0.65)' }}>
                내 순위
              </p>
              <p className="text-f20 font-bold text-cream leading-tight mt-0.5">
                {categoryRanking.rank}위
              </p>
            </div>
            <div className="text-right">
              <p className="text-f12 font-semibold text-cream">
                {formatRankingValue(categoryRanking.value, categoryRanking.unit)}
              </p>
              {categoryRanking.percentile !== null && (
                <p className="text-f12 mt-0.5" style={{ color: 'rgba(242,230,177,0.65)' }}>
                  상위 {categoryRanking.percentile}%
                </p>
              )}
              <p className="text-f12 mt-0.5" style={{ color: 'rgba(242,230,177,0.65)' }}>
                내 순위 보기 →
              </p>
            </div>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
