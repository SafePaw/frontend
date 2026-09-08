import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useFcm } from './hooks/useFcm'
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
import TerritoryPage from './pages/territory/territoryPage'
import RankingPage from './pages/ranking/rankingPage'
import WalkReadyPage from './pages/walk/walkReadyPage'
import WalkActivePage from './pages/walk/walkActivePage'
import WalkResultPage from './pages/walk/walkResultPage'
import WalkSharePage from './pages/walk/walkSharePage'
import MyPage from './pages/my/myPage'
import WalkHistoryPage from './pages/my/walkHistoryPage'
import WalkHistoryDetailPage from './pages/my/walkHistoryDetailPage'
import DogListPage from './pages/dogs/dogListPage'
import DogRegistrationPage from './pages/dogs/dogRegistrationPage'
import DogDetailPage from './pages/dogs/dogDetailPage'
import CrewPage from './pages/crew/crewPage'
import CrewTerritoryPage from './pages/crew/crewTerritoryPage'

export default function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth)
  const { fcmNotice } = useFcm()

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  return (
    <BrowserRouter>
      {fcmNotice && (
        <div
          role="alert"
          aria-live="assertive"
          className="fixed top-4 left-4 right-4 z-50 bg-navy text-cream rounded-xl px-4 py-3 shadow-lg pointer-events-none"
        >
          {fcmNotice.title && (
            <p className="text-f16 font-semibold">{fcmNotice.title}</p>
          )}
          {fcmNotice.body && (
            <p className="text-f12 mt-0.5">{fcmNotice.body}</p>
          )}
        </div>
      )}
      <Routes>
        <Route path={ROUTES.SPLASH} element={<SplashPage />} />
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.OAUTH_CALLBACK} element={<OAuthCallbackPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path={ROUTES.ONBOARDING.DOG} element={<DogRegisterPage />} />
          <Route path={ROUTES.ONBOARDING.COLOR} element={<TerritoryColorPage />} />
          <Route path={ROUTES.ONBOARDING.TUTORIAL} element={<ServiceIntroPage />} />
          <Route path={ROUTES.HOME} element={<HomePage />} />
          <Route path={ROUTES.TERRITORY} element={<TerritoryPage />} />
          <Route path={ROUTES.RANKING} element={<RankingPage />} />
          <Route path={ROUTES.WALK.READY} element={<WalkReadyPage />} />
          <Route path={ROUTES.WALK.ACTIVE} element={<WalkActivePage />} />
          <Route path={ROUTES.WALK.RESULT} element={<WalkResultPage />} />
          <Route path={ROUTES.WALK.SHARE} element={<WalkSharePage />} />
          <Route path={ROUTES.MY.INDEX} element={<MyPage />} />
          <Route path={ROUTES.MY.HISTORY} element={<WalkHistoryPage />} />
          <Route path="/my/history/:walkId" element={<WalkHistoryDetailPage />} />
          <Route path={ROUTES.DOGS.INDEX} element={<DogListPage />} />
          <Route path={ROUTES.DOGS.REGISTRATION} element={<DogRegistrationPage />} />
          <Route path={ROUTES.DOGS.DETAIL} element={<DogDetailPage />} />
          <Route path={ROUTES.CREW.INDEX} element={<CrewPage />} />
          <Route path={ROUTES.CREW.TERRITORY} element={<CrewTerritoryPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
