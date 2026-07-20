import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { activeWalkStorage } from '../../utils/activeWalkStorage'
import { getDogs } from '../../api/dogs'
import HomeMap from '../../components/home/homeMap'
import HomeDogCard from '../../components/home/homeDogCard'
import { ROUTES } from '../../constants/routes'
import type { Dog } from '../../types/dog'
import mapIcon from '../../assets/map.png'
import flagIcon from '../../assets/flag.png'
import rankingIcon from '../../assets/ranking.png'
import pawIcon from '../../assets/paw.png'

export default function HomePage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const [dogs, setDogs] = useState<Dog[]>([])
  const [selectedDogId, setSelectedDogId] = useState<number | null>(null)
  const [hasActiveWalk, setHasActiveWalk] = useState(false)

  useEffect(() => {
    getDogs()
      .then((list) => {
        setDogs(list)
        if (list.length >= 1) setSelectedDogId(list[0].id)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!user) return
    const activeWalk = activeWalkStorage.get(user.id)
    setHasActiveWalk(!!activeWalk)
  }, [user])

  return (
    <div className="relative h-full overflow-hidden">
      <div className="absolute inset-0">
        <HomeMap />
      </div>

      <div className="absolute top-0 left-0 right-0 z-10 px-4 pt-14 pb-3 pointer-events-none">
        <div className="inline-flex bg-cream rounded-full px-1 py-1 shadow-md border border-navy-15 pointer-events-auto">
          <span className="px-4 py-1.5 rounded-full bg-navy text-cream text-f12 font-semibold select-none">
            내 영토
          </span>
          <span
            className="px-4 py-1.5 rounded-full text-navy-40 text-f12 select-none cursor-not-allowed"
            aria-disabled="true"
            title="준비 중인 기능입니다"
          >
            크루
          </span>
          <span
            className="px-4 py-1.5 rounded-full text-navy-40 text-f12 select-none cursor-not-allowed"
            aria-disabled="true"
            title="준비 중인 기능입니다"
          >
            전체
          </span>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10">
        <div className="mx-4 mb-3 bg-cream rounded-xl border border-navy-15 shadow-md">
          <HomeDogCard
            dogs={dogs}
            selectedDogId={selectedDogId}
            onSelectDog={setSelectedDogId}
            hasActiveWalk={hasActiveWalk}
          />
        </div>

        <div
          className="bg-cream border-t border-navy-15 flex"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          {/* 지도 */}
          <div className="flex-1 flex flex-col items-center py-2 gap-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-navy mb-0.5" />
            <img src={mapIcon} alt="지도" className="w-6 h-6 object-contain" />
            <span className="text-f12 font-semibold text-navy">지도</span>
          </div>

          {/* 영토 */}
          <button
            disabled
            className="flex-1 flex flex-col items-center py-2 gap-0.5 opacity-40 cursor-not-allowed"
            title="준비 중인 기능입니다"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-transparent mb-0.5" />
            <img src={flagIcon} alt="영토" className="w-6 h-6 object-contain" />
            <span className="text-f12 text-navy-40">영토</span>
          </button>

          {/* 랭킹 */}
          <button
            disabled
            className="flex-1 flex flex-col items-center py-2 gap-0.5 opacity-40 cursor-not-allowed"
            title="준비 중인 기능입니다"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-transparent mb-0.5" />
            <img src={rankingIcon} alt="랭킹" className="w-6 h-6 object-contain" />
            <span className="text-f12 text-navy-40">랭킹</span>
          </button>

          {/* 마이 */}
          <button
            onClick={() => navigate(ROUTES.MY.INDEX)}
            className="flex-1 flex flex-col items-center py-2 gap-0.5 active:opacity-70 transition-opacity"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-transparent mb-0.5" />
            <img src={pawIcon} alt="마이" className="w-6 h-6 object-contain" />
            <span className="text-f12 text-navy-40">마이</span>
          </button>
        </div>
      </div>
    </div>
  )
}
