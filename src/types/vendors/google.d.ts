interface GoogleCodeClientConfig {
  client_id: string
  scope: string
  ux_mode?: 'redirect' | 'popup'
  redirect_uri?: string
  state?: string
  callback?: (response: GoogleCodeResponse) => void
  error_callback?: (error: { type: string; message?: string }) => void
  select_account?: boolean
}

interface GoogleCodeResponse {
  code: string
  scope: string
  state?: string
}

interface GoogleCodeClient {
  requestCode(): void
}

interface GoogleAccountsOAuth2 {
  initCodeClient(config: GoogleCodeClientConfig): GoogleCodeClient
}

interface GoogleStatic {
  accounts: {
    oauth2: GoogleAccountsOAuth2
  }
}

interface Window {
  google?: GoogleStatic
}
