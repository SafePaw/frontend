import { useEffect } from 'react'
import safepawLogoLight from '../../assets/light/safepawLogoLight.png'
import safepawLogoDark from '../../assets/dark/safepawLogoDark.png'
import { createOAuthState } from '../../utils/oauthState'
import type { OAuthProvider } from '../../types/auth'

const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY ?? ''
const KAKAO_REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI ?? ''
const NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_CLIENT_ID ?? ''
const NAVER_REDIRECT_URI = import.meta.env.VITE_NAVER_REDIRECT_URI ?? ''
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''
const GOOGLE_REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI ?? ''

interface OAuthProviderConfig {
  id: OAuthProvider
  label: string
  bg: string
  color: string
  border: string
}

const OAUTH_PROVIDERS: OAuthProviderConfig[] = [
  {
    id: 'kakao',
    label: '카카오로 로그인',
    bg: '#FEE500',
    color: '#191919',
    border: 'transparent',
  },
  {
    id: 'naver',
    label: '네이버로 로그인',
    bg: '#03C75A',
    color: '#FFFFFF',
    border: 'transparent',
  },
  {
    id: 'google',
    label: 'Google로 로그인',
    bg: '#FFFFFF',
    color: '#191919',
    border: '#DADCE0',
  },
]

export default function LoginPage() {
  useEffect(() => {
    if (window.Kakao && KAKAO_JS_KEY && !window.Kakao.isInitialized()) {
      window.Kakao.init(KAKAO_JS_KEY)
    }
  }, [])

  const handleKakaoLogin = () => {
    if (!window.Kakao?.isInitialized()) {
      console.warn('[SafePaw] Kakao SDK not initialized')
      return
    }
    const state = createOAuthState('kakao')
    window.Kakao.Auth.authorize({ redirectUri: KAKAO_REDIRECT_URI, state })
  }

  const handleNaverLogin = () => {
    if (!NAVER_CLIENT_ID || !NAVER_REDIRECT_URI) {
      console.warn('[SafePaw] VITE_NAVER_CLIENT_ID or VITE_NAVER_REDIRECT_URI is not set')
      return
    }
    const state = createOAuthState('naver')
    const url = new URL('https://nid.naver.com/oauth2.0/authorize')
    url.searchParams.set('response_type', 'code')
    url.searchParams.set('client_id', NAVER_CLIENT_ID)
    url.searchParams.set('redirect_uri', NAVER_REDIRECT_URI)
    url.searchParams.set('state', state)
    window.location.href = url.toString()
  }

  const handleGoogleLogin = () => {
    if (!window.google?.accounts?.oauth2 || !GOOGLE_CLIENT_ID || !GOOGLE_REDIRECT_URI) {
      console.warn('[SafePaw] Google OAuth2 unavailable or env vars not set')
      return
    }
    const state = createOAuthState('google')
    const client = window.google.accounts.oauth2.initCodeClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: 'openid email profile',
      ux_mode: 'redirect',
      redirect_uri: GOOGLE_REDIRECT_URI,
      state,
    })
    client.requestCode()
  }

  const handleOAuthLogin = (provider: OAuthProvider) => {
    switch (provider) {
      case 'kakao':
        handleKakaoLogin()
        break
      case 'naver':
        handleNaverLogin()
        break
      case 'google':
        handleGoogleLogin()
        break
    }
  }

  return (
    <div className="flex flex-col h-full bg-cream px-6">
      <div className="flex-1 flex flex-col items-center justify-center">
        <picture
          className="w-16 h-16 mb-6 animate-fade-scale-in"
        >
          <source srcSet={safepawLogoDark} media="(prefers-color-scheme: dark)" />
          <img
            src={safepawLogoLight}
            alt="SafePaw"
            className="w-full h-full object-contain p-2"
          />
        </picture>

        <p
          className="text-f12 font-light text-navy-70 mb-10 text-center animate-fade-up"
          style={{ animationDelay: '0.2s' }}
        >
          소셜 계정으로 간편하게 시작하세요
        </p>

        <div
          className="w-full flex flex-col gap-3 animate-fade-up"
          style={{ animationDelay: '0.35s' }}
        >
          {OAUTH_PROVIDERS.map((provider) => (
            <button
              key={provider.id}
              onClick={() => handleOAuthLogin(provider.id)}
              style={{
                backgroundColor: provider.bg,
                color: provider.color,
                border: `1px solid ${provider.border}`,
              }}
              className="w-full max-w-xs mx-auto py-2 rounded-pill text-f16 font-medium flex items-center justify-center transition-opacity duration-150 active:scale-[0.97]"
            >
              {provider.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
