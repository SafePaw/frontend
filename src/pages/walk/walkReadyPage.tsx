import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/button'
import GuideModal from '../../components/guide/guideModal'
import GuideVisual from '../../components/guide/walkReadyVisual'
import { PRE_WALK_GUIDE_STEPS } from '../../constants/guideSteps'
import { useGuideFlow } from '../../hooks/useGuideFlow'
import { ROUTES } from '../../constants/routes'

export default function WalkReadyPage() {
  const navigate = useNavigate()
  const { hasSeen, markSeen } = useGuideFlow('preWalk')

  const [isGuideOpen, setIsGuideOpen] = useState(!hasSeen)

  function handleGuideComplete() {
    markSeen()
    navigate(ROUTES.WALK.ACTIVE, { replace: true })
  }

  function handleGuideDismiss() {
    setIsGuideOpen(false)
  }

  return (
    <div className="flex flex-col h-full bg-cream">
      <div className="flex items-center px-6 pt-14 pb-6">
        <button
          onClick={() => navigate(-1)}
          className="mr-3 text-f20 text-navy-70 leading-none"
          aria-label="뒤로가기"
        >
          ←
        </button>
        <h1 className="text-f20 font-semibold text-navy">산책 준비</h1>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <p className="text-f16 text-navy-40">지도 준비 중...</p>
      </div>

      <div className="px-6 pb-12">
        <Button variant="fill" size="lg" fullWidth onClick={() => navigate(ROUTES.WALK.ACTIVE)}>
          산책 시작
        </Button>
      </div>

      <GuideModal
        steps={PRE_WALK_GUIDE_STEPS}
        isOpen={isGuideOpen}
        onComplete={handleGuideComplete}
        onDismiss={handleGuideDismiss}
        completeCta="산책 시작하기"
        dismissCta="나중에 보기"
        renderVisual={(type) => <GuideVisual type={type} />}
      />
    </div>
  )
}
