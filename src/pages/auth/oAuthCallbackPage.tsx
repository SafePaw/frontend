import { useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { socialLogin } from '../../api/auth'
import { useAuthStore } from '../../stores/authStore'
import { ROUTES } from '../../constants/routes'
import { GUIDE_SEEN_KEYS } from '../../constants/guideSeenKeys'
import { validateOAuthState } from '../../utils/oauthState'
import type { OAuthProvider, AuthProvider } from '../../types/auth'

const REDIRECT_URIS: Record<OAuthProvider, string> = {
  kakao: import.meta.env.VITE_KAKAO_REDIRECT_URI ?? '',
  naver: import.meta.env.VITE_NAVER_REDIRECT_URI ?? '',
  google: import.meta.env.VITE_GOOGLE_REDIRECT_URI ?? '',
}

const VALID_PROVIDERS: OAuthProvider[] = ['kakao', 'naver', 'google']

function isValidProvider(value: unknown): value is OAuthProvider {
  return VALID_PROVIDERS.includes(value as OAuthProvider)
}

export default function OAuthCallbackPage() {
  const navigate = useNavigate()
  const { provider } = useParams<{ provider: string }>()
  const setAuth = useAuthStore((state) => state.setAuth)
  const calledRef = useRef(false)

  useEffect(() => {
    if (calledRef.current) return
    calledRef.current = true

    const searchParams = new URLSearchParams(window.location.search)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // 1. provider 검증
    if (!isValidProvider(provider)) {
      console.error('[SafePaw] OAuth callback: invalid provider', provider)
      navigate(ROUTES.LOGIN, { replace: true })
      return
    }

    // 2. error
    if (error) {
      const desc = searchParams.get('error_description') ?? error
      console.warn('[SafePaw] OAuth callback: provider returned error —', desc)
      navigate(ROUTES.LOGIN, { replace: true })
      return
    }

    // 3. authorization code 존재 여부
    if (!code) {
      console.error('[SafePaw] OAuth callback: authorization code missing')
      navigate(ROUTES.LOGIN, { replace: true })
      return
    }

    // 4. state 검증
    if (!validateOAuthState(provider, state)) {
      console.error('[SafePaw] OAuth callback: state mismatch — possible CSRF attempt')
      navigate(ROUTES.LOGIN, { replace: true })
      return
    }

    // 5. redirectUri
    const redirectUri = REDIRECT_URIS[provider]
    if (!redirectUri) {
      console.error('[SafePaw] OAuth callback: redirect URI not configured for', provider)
      navigate(ROUTES.LOGIN, { replace: true })
      return
    }

    // 6. 백엔드 social login 호출
    const apiProvider = provider.toUpperCase() as AuthProvider
    socialLogin({ provider: apiProvider, authorizationCode: code, redirectUri })
      .then((res) => {
        if (res.success && res.data) {
          setAuth(
            { accessToken: res.data.accessToken, refreshToken: res.data.refreshToken },
            res.data.user,
          )
          if (res.data.user.dogSetupRequired) {
            navigate(ROUTES.ONBOARDING.DOG, { replace: true })
          } else {
            const serviceIntroSeen =
              localStorage.getItem(GUIDE_SEEN_KEYS.serviceIntro) === 'true'
            navigate(
              serviceIntroSeen ? ROUTES.HOME : ROUTES.ONBOARDING.TUTORIAL,
              { replace: true },
            )
          }
        } else {
          console.error('[SafePaw] OAuth callback: backend returned error', res.error)
          navigate(ROUTES.LOGIN, { replace: true })
        }
      })
      .catch(() => {
        console.error('[SafePaw] OAuth callback: unexpected error')
        navigate(ROUTES.LOGIN, { replace: true })
      })
  }, [navigate, provider, setAuth])

  return (
    <div className="flex flex-col h-full bg-cream items-center justify-center gap-6">
      <div className="text-center mt-2">
        <h2 className="text-f20 font-medium text-navy tracking-[-0.4px]">처리 중</h2>
        <p className="mt-1 text-f12 font-light text-navy-70">정보를 불러오는 중입니다</p>
        <p className="mt-0.5 text-f12 font-light text-navy-40">잠시만 기다려주세요</p>
      </div>
    </div>
  )
}
