import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/button'
import { ROUTES } from '../../constants/routes'
import safepawLogoLight from '../../assets/light/safepawLogoLight.png'
import safepawLogoDark from '../../assets/dark/safepawLogoDark.png'

export default function SplashPage() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col h-full bg-cream px-6">
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <picture
          className="animate-fade-scale-in"
          style={{ width: 128, height: 128 }}
        >
          <source srcSet={safepawLogoDark} media="(prefers-color-scheme: dark)" />
          <img src={safepawLogoLight} alt="SafePaw" className="w-full h-full object-contain" />
        </picture>

        <div className="text-center animate-fade-up" style={{ animationDelay: '0.3s' }}>
          <h1 className="text-f24 font-semibold text-navy tracking-[-0.5px]">SafePaw</h1>
          <p className="mt-2 text-f12 font-light text-navy-40">강아지와 함께, 우리 동네 땅따먹기</p>
        </div>
      </div>

      <div
        className="pb-12 flex flex-col items-center gap-4 animate-fade-up"
        style={{ animationDelay: '0.5s' }}
      >
        <Button variant="fill" size="lg" fullWidth onClick={() => navigate(ROUTES.LOGIN)}>
          시작하기
        </Button>
        <button className="text-f12 font-light text-navy-40" onClick={() => navigate(ROUTES.LOGIN)}>
          이미 계정이 있어요
        </button>
      </div>
    </div>
  )
}
