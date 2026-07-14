interface KakaoAuthAuthorizeOptions {
  redirectUri: string
  state?: string
  scope?: string
  prompt?: string
  loginHint?: string
  nonce?: string
  serviceTerms?: string
  throughTalk?: boolean
}

interface KakaoAuth {
  authorize(options: KakaoAuthAuthorizeOptions): void
}

interface KakaoStatic {
  init(appKey: string): void
  isInitialized(): boolean
  Auth: KakaoAuth
}

interface Window {
  Kakao?: KakaoStatic
}
