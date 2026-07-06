import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/button'
import { ROUTES } from '../../constants/routes'

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col h-full bg-cream">
      <div className="flex items-center justify-between px-6 pt-14 pb-6">
        <h1 className="text-f20 font-semibold text-navy">SafePaw</h1>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <p className="text-f16 text-navy-40">지도 준비 중...</p>
      </div>

      <div className="px-6 pb-12">
        <Button
          variant="fill"
          size="lg"
          fullWidth
          onClick={() => navigate(ROUTES.WALK.READY)}
        >
          산책 시작
        </Button>
      </div>
    </div>
  )
}
