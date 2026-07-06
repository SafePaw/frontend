import { useNavigate } from 'react-router-dom'
import GuideModal from '../../components/guide/guideModal'
import GuideVisual from '../../components/guide/serviceIntroVisual'
import { SERVICE_INTRO_STEPS } from '../../constants/guideSteps'
import { useGuideFlow } from '../../hooks/useGuideFlow'
import { ROUTES } from '../../constants/routes'

export default function ServiceIntroPage() {
  const navigate = useNavigate()
  const { markSeen } = useGuideFlow('serviceIntro')

  function handleComplete() {
    markSeen()
    navigate(ROUTES.HOME, { replace: true })
  }

  function handleDismiss() {
    markSeen()
    navigate(ROUTES.HOME, { replace: true })
  }

  return (
    <div className="h-full bg-cream">
      <GuideModal
        steps={SERVICE_INTRO_STEPS}
        isOpen={true}
        onComplete={handleComplete}
        onDismiss={handleDismiss}
        completeCta="시작하기"
        dismissCta="건너뛰기"
        renderVisual={(type) => <GuideVisual type={type} />}
      />
    </div>
  )
}
