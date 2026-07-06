import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ROUTES } from './constants/routes'
import SplashPage from './pages/auth/splashPage'
import LoginPage from './pages/auth/loginPage'
import OAuthCallbackPage from './pages/auth/oAuthCallbackPage'
import ProtectedRoute from './routes/protectedRoute'
import { useAuthStore } from './stores/authStore'
import DogRegisterPage from './pages/onboarding/dogRegisterPage'
import TerritoryColorPage from './pages/onboarding/territoryColorPage'
import ServiceIntroPage from './pages/onboarding/serviceIntroPage'
import HomePage from './pages/home/homePage'
import WalkReadyPage from './pages/walk/walkReadyPage'
import WalkActivePage from './pages/walk/walkActivePage'

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

        <Route element={<ProtectedRoute />}>
          <Route path={ROUTES.ONBOARDING.DOG} element={<DogRegisterPage />} />
          <Route path={ROUTES.ONBOARDING.COLOR} element={<TerritoryColorPage />} />
          <Route path={ROUTES.ONBOARDING.TUTORIAL} element={<ServiceIntroPage />} />
          <Route path={ROUTES.HOME} element={<HomePage />} />
          <Route path={ROUTES.WALK.READY} element={<WalkReadyPage />} />
          <Route path={ROUTES.WALK.ACTIVE} element={<WalkActivePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
