import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ROUTES } from './constants/routes'
import SplashPage from './pages/auth/splashPage'
import LoginPage from './pages/auth/loginPage'
import OAuthCallbackPage from './pages/auth/oAuthCallbackPage'
import ProtectedRoute from './routes/protectedRoute'
import { useAuthStore } from './stores/authStore'

export default function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth)

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.SPLASH} element={<SplashPage />} />
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.OAUTH_CALLBACK} element={<OAuthCallbackPage />} />

        <Route element={<ProtectedRoute />}></Route>
      </Routes>
    </BrowserRouter>
  )
}
