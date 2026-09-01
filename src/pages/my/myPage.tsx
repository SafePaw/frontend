import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { logout } from '../../api/auth'
import { getMeFull } from '../../api/me'
import { getDogs } from '../../api/dogs'
import { useAuthStore } from '../../stores/authStore'
import { useNotificationSettings } from '../../hooks/useNotificationSettings'
import Button from '../../components/ui/button'
import BottomNav from '../../components/layout/bottomNav'
import AccountInfoSection from '../../components/my/accountInfoSection'
import MyDogsSection from '../../components/my/myDogsSection'
import type { MeResponse } from '../../types/me'
import type { Dog } from '../../types/dog'

const APP_VERSION = '0.0.1'

export default function MyPage() {
  const navigate = useNavigate()
  const clearAuth = useAuthStore((state) => state.clearAuth)

  const [me, setMe] = useState<MeResponse | null>(null)
  const [dogDetailMap, setDogDetailMap] = useState<Map<number, Dog>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [comingSoonMessage, setComingSoonMessage] = useState<string | null>(null)

  const { fcmStatus, enableNotifications, unregisterNotificationToken } = useNotificationSettings()

  useEffect(() => {
    async function load() {
      try {
        const meData = await getMeFull()
        setMe(meData)
      } catch {
        setError('사용자 정보를 불러오지 못했어요.')
        setIsLoading(false)
        return
      }
      try {
        const dogs = await getDogs()
        setDogDetailMap(new Map(dogs.map((d) => [d.id, d])))
      } catch {
        /*  */
      }
      setIsLoading(false)
    }
    load()
  }, [])

  async function handleLogout() {
    await unregisterNotificationToken()
    try {
      await logout()
    } catch {
      console.error('[SafePaw] 로그아웃: 서버 logout 실패')
    } finally {
      clearAuth()
      navigate(ROUTES.LOGIN, { replace: true })
    }
  }

  function showComingSoon() {
    setComingSoonMessage('준비 중이에요')
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-cream items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-navy-15 border-t-navy animate-spin" />
      </div>
    )
  }

  if (error || !me) {
    return (
      <div className="flex flex-col h-full bg-cream items-center justify-center px-6 gap-4">
        <p className="text-f16 text-navy-70 text-center">
          {error ?? '사용자 정보를 불러오지 못했어요.'}
        </p>
        <Button variant="ghost" onClick={() => window.location.reload()}>
          다시 시도
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-cream">
      <div className="flex items-center px-6 pt-14 pb-6">
        <button
          onClick={() => navigate(-1)}
          className="mr-3 text-f20 text-navy-70 leading-none"
          aria-label="뒤로가기"
        >
          ←
        </button>
        <h1 className="text-f20 font-semibold text-navy">마이페이지</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-24 space-y-5">
        <AccountInfoSection me={me} onUpdated={setMe} />

        <MyDogsSection
          dogs={me.dogs}
          dogDetailMap={dogDetailMap}
          onNavigateDog={(id) => navigate(ROUTES.DOGS.DETAIL_OF(id))}
          onRegister={() => navigate(ROUTES.DOGS.REGISTRATION)}
        />

        {/* 메뉴 */}
        <div className="space-y-1.5">
          <div className="bg-navy-5 rounded-xl overflow-hidden divide-y divide-navy-8">
            <MenuRow label="강아지 관리" onClick={() => navigate(ROUTES.DOGS.INDEX)} />
            <MenuRow label="크루 관리" onClick={() => navigate(ROUTES.CREW.INDEX)} />
            <MenuRow label="산책 기록" onClick={() => navigate(ROUTES.MY.HISTORY)} />
            <MenuRow label="설정" onClick={showComingSoon} />
          </div>
          {comingSoonMessage && (
            <p className="text-f12 text-navy-70 text-center py-1">{comingSoonMessage}</p>
          )}
        </div>

        {/* 알림 설정 */}
        <div className="bg-navy-5 rounded-xl px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-f16 text-navy">알림</p>
              <p className="text-f12 text-navy-70 mt-0.5">
                {fcmStatus === 'unsupported' && '이 브라우저는 알림을 지원하지 않아요'}
                {fcmStatus === 'default' && '산책 관련 알림을 받을 수 있어요'}
                {fcmStatus === 'denied' && '브라우저 설정에서 알림을 허용해 주세요'}
                {fcmStatus === 'granted' && '알림 권한이 허용되어 있어요'}
                {fcmStatus === 'token-ready' && '알림이 활성화되어 있어요'}
                {fcmStatus === 'error' && '알림 설정 중 문제가 발생했어요'}
              </p>
            </div>
            {(fcmStatus === 'default' || fcmStatus === 'granted') && (
              <Button size="sm" variant="ghost" onClick={enableNotifications}>
                활성화
              </Button>
            )}
            {fcmStatus === 'token-ready' && (
              <span className="text-f12 text-ok flex-shrink-0">켜짐</span>
            )}
            {fcmStatus === 'error' && (
              <Button size="sm" variant="ghost" onClick={enableNotifications}>
                재시도
              </Button>
            )}
          </div>
        </div>

        {/* 로그아웃 */}
        <div className="bg-navy-5 rounded-xl overflow-hidden">
          <button
            onClick={handleLogout}
            className="w-full px-5 py-4 text-left text-f16 text-err flex items-center active:opacity-70 transition-opacity"
          >
            로그아웃
          </button>
        </div>

        {/* 서비스 정보 */}
        <div className="pt-2 space-y-3">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={showComingSoon}
              className="text-f12 text-navy-70 active:opacity-70 transition-opacity"
            >
              개인정보처리방침
            </button>
            <span className="text-navy-15 text-f12 select-none" aria-hidden="true">
              ·
            </span>
            <button
              onClick={showComingSoon}
              className="text-f12 text-navy-70 active:opacity-70 transition-opacity"
            >
              이용약관
            </button>
            <span className="text-navy-15 text-f12 select-none" aria-hidden="true">
              ·
            </span>
            <button
              onClick={showComingSoon}
              className="text-f12 text-navy-70 active:opacity-70 transition-opacity"
            >
              위치정보 이용약관
            </button>
          </div>
          <p className="text-f12 text-navy-70 text-center">v{APP_VERSION}</p>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

function MenuRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full px-5 py-4 text-left text-f16 text-navy flex items-center justify-between active:opacity-70 transition-opacity"
    >
      <span>{label}</span>
      <span className="text-navy-70" aria-hidden="true">
        ›
      </span>
    </button>
  )
}
