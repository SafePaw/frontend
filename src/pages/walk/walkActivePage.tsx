import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GuideModal from '../../components/guide/guideModal'
import GuideVisual from '../../components/guide/walkActiveVisual'
import { WALK_HELP_STEPS } from '../../constants/guideSteps'
import { ROUTES } from '../../constants/routes'
import dogCaloriesImg from '../../assets/dogCalories.png'
import flagImg from '../../assets/flag.png'

export default function WalkActivePage() {
  const navigate = useNavigate()
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  const statLabelClass = isPaused ? 'text-navy-15' : 'text-navy-40'
  const statValueClass = isPaused ? 'text-navy-40' : 'text-navy'

  return (
    <div className="flex flex-col h-full bg-cream">
      <div className="flex items-center justify-between px-6 pt-14 pb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-f20 font-semibold text-navy">산책 중</h1>
          {isPaused ? (
            <span className="px-3 py-1 rounded-pill bg-navy-8 text-f12 text-navy-40 font-medium">
              ⏸ 일시정지
            </span>
          ) : (
            <span className="px-3 py-1 rounded-pill bg-ok/10 text-f12 text-ok font-medium">
              산책 중 ●
            </span>
          )}
        </div>
        <button
          onClick={() => setIsHelpOpen(true)}
          className="w-9 h-9 rounded-full bg-navy-8 flex items-center justify-center active:opacity-70 transition-opacity"
          aria-label="도움말"
        >
          <span className="text-navy font-semibold text-f16 leading-none">?</span>
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <p className="text-f16 text-navy-40">GPS 트래킹 준비 중...</p>
      </div>

      <div className="bg-white border-t border-navy-8">
        <div className="flex px-6 pt-5 pb-4">
          <div className="flex-1 flex flex-col items-center gap-1">
            <span className={`text-f12 ${statLabelClass}`}>거리</span>
            <span className={`text-f20 font-light ${statValueClass}`}>—</span>
          </div>
          <div className="w-px bg-navy-8 self-stretch" />
          <div className="flex-1 flex flex-col items-center gap-1">
            <span className={`text-f12 ${statLabelClass}`}>획득 영토</span>
            <span className={`text-f20 font-light ${statValueClass}`}>—</span>
          </div>
          <div className="w-px bg-navy-8 self-stretch" />
          <div className="flex-1 flex flex-col items-center gap-1">
            <span className={`text-f12 ${statLabelClass} flex items-center gap-1`}>
              <img src={dogCaloriesImg} className="w-4 h-4" alt="" />칼로리
            </span>
            <span className={`text-f20 font-light ${statValueClass}`}>—</span>
          </div>
        </div>

        <div className="mx-6 h-px bg-navy-8" />

        <div className="flex gap-3 px-6 py-4">
          {isPaused ? (
            <>
              <button
                onClick={() => setIsPaused(false)}
                className="flex-[11] py-3 rounded-sm bg-navy text-white text-f16 font-medium active:opacity-70 transition-opacity"
              >
                ▶ 재개하기
              </button>
              <button
                onClick={() => navigate(ROUTES.WALK.CONFIRM_END)}
                className="flex-[10] py-3 rounded-sm bg-navy-8 text-navy-70 text-f16 font-medium border border-navy-15 active:opacity-70 transition-opacity flex items-center justify-center gap-1.5"
              >
                <img src={flagImg} className="w-5 h-5" alt="" />종료
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsPaused(true)}
                className="flex-[10] py-3 rounded-sm bg-navy-8 text-navy-70 text-f16 font-medium active:opacity-70 transition-opacity"
              >
                ⏸ 일시정지
              </button>
              <button
                onClick={() => navigate(ROUTES.WALK.CONFIRM_END)}
                className="flex-[11] py-3 rounded-sm bg-navy text-white text-f16 font-medium active:opacity-70 transition-opacity flex items-center justify-center gap-1.5"
              >
                <img src={flagImg} className="w-5 h-5" alt="" />산책 종료
              </button>
            </>
          )}
        </div>
      </div>

      <GuideModal
        steps={WALK_HELP_STEPS}
        isOpen={isHelpOpen}
        onComplete={() => setIsHelpOpen(false)}
        onDismiss={() => setIsHelpOpen(false)}
        completeCta="확인"
        renderVisual={(type) => <GuideVisual type={type} />}
      />
    </div>
  )
}
