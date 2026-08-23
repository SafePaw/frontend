import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { formatTerritory } from '../../utils/rankingFormat'
import type { MyCrewRanking } from '../../types/crewTerritory'

interface MyCrewRankingFloatingProps {
  myCrewRanking: MyCrewRanking
  visible: boolean
  onNavigate: () => void
}

export default function MyCrewRankingFloating({
  myCrewRanking,
  visible,
  onNavigate,
}: MyCrewRankingFloatingProps) {
  const prefersReducedMotion = useReducedMotion()

  if (myCrewRanking.rank === null) return null

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="crew-floating"
          initial={prefersReducedMotion ? false : { y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={prefersReducedMotion ? {} : { y: 12, opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="fixed left-1/2 -translate-x-1/2 w-full px-4"
          style={{
            maxWidth: 430,
            bottom: 'calc(56px + env(safe-area-inset-bottom, 0px))',
            zIndex: 40,
          }}
        >
          <button
            type="button"
            onClick={onNavigate}
            aria-label={`내 크루 순위 ${myCrewRanking.rank}위 보기`}
            className="w-full bg-navy text-cream rounded-xl px-4 py-3 flex items-center justify-between shadow-lg focus-visible:outline-none active:opacity-80 transition-opacity"
          >
            <div className="text-left">
              <p className="text-f12" style={{ color: 'rgba(242,230,177,0.65)' }}>
                내 크루 순위
              </p>
              <p className="text-f20 font-bold text-cream leading-tight mt-0.5">
                {myCrewRanking.rank}위
              </p>
            </div>
            <div className="text-right">
              <p className="text-f12 font-semibold text-cream">
                {formatTerritory(myCrewRanking.value)}
              </p>
              {myCrewRanking.percentile !== null && (
                <p className="text-f12 mt-0.5" style={{ color: 'rgba(242,230,177,0.65)' }}>
                  상위 {myCrewRanking.percentile}%
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
