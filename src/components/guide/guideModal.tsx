import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '../ui/button'
import GuideStep from './guideStep'
import type { GuideStepData, GuideVisualType } from '../../constants/guideSteps'

interface GuideModalProps {
  steps: GuideStepData[]
  isOpen: boolean
  onComplete: () => void
  onDismiss: () => void
  completeCta: string
  dismissCta?: string
  renderVisual: (type: GuideVisualType) => React.ReactNode
}

export default function GuideModal({
  steps,
  isOpen,
  onComplete,
  onDismiss,
  completeCta,
  dismissCta,
  renderVisual,
}: GuideModalProps) {
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    if (isOpen) setStepIndex(0)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onDismiss()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onDismiss])

  if (!isOpen) return null

  const isLast = stepIndex === steps.length - 1
  const current = steps[stepIndex]

  function handleNext() {
    if (isLast) {
      onComplete()
    } else {
      setStepIndex((i) => i + 1)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="가이드"
    >
      <div className="w-full max-w-[430px] flex flex-col min-h-dvh">
        {/* 안내: 그래픽 */}
        <div className="relative flex-1 bg-[#1A2030] overflow-hidden min-h-48">
          <button
            onClick={onDismiss}
            aria-label="가이드 닫기"
            className="absolute top-14 right-6 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white/70 text-f16 leading-none active:opacity-70 transition-opacity"
          >
            ✕
          </button>

          <AnimatePresence mode="wait">
            <motion.div
              key={stepIndex}
              className="absolute inset-0"
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -32 }}
              transition={{ duration: 0.28, ease: 'easeInOut' }}
            >
              {renderVisual(current.visualType)}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 안내: 텍스트 */}
        <div
          className="bg-cream rounded-t-2xl shrink-0 px-6 pt-8"
          style={{ paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom))' }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={stepIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <GuideStep
                title={current.title}
                description={current.description}
                current={stepIndex}
                total={steps.length}
              />
            </motion.div>
          </AnimatePresence>

          <Button
            variant="fill"
            size="lg"
            fullWidth
            onClick={handleNext}
            aria-label={isLast ? completeCta : '다음 단계로 이동'}
          >
            {isLast ? completeCta : '다음'}
          </Button>

          {dismissCta && (
            <button
              onClick={onDismiss}
              className="w-full text-f12 font-light text-navy-40 py-3 mt-1 active:opacity-70 transition-opacity"
              aria-label={dismissCta}
            >
              {dismissCta}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
