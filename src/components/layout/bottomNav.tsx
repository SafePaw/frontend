import { useNavigate, useLocation } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import mapIcon from '../../assets/map.png'
import flagIcon from '../../assets/flag.png'
import rankingIcon from '../../assets/ranking.png'
import pawIcon from '../../assets/paw.png'
import crewIcon from '../../assets/crewImage.png'

export default function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const isMap = pathname === ROUTES.HOME
  const isTerritory = pathname === ROUTES.TERRITORY
  const isRanking = pathname === ROUTES.RANKING
  const isCrew = pathname === ROUTES.CREW.INDEX || pathname === ROUTES.CREW.TERRITORY
  const isMy = pathname.startsWith(ROUTES.MY.INDEX)

  return (
    <div
      className="bg-cream border-t border-navy-15 flex"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* 지도 */}
      <button
        onClick={() => navigate(ROUTES.HOME)}
        className="flex-1 flex flex-col items-center py-2 gap-0.5 active:opacity-70 transition-opacity"
      >
        <span
          className={`w-1.5 h-1.5 rounded-full mb-0.5 ${isMap ? 'bg-navy' : 'bg-transparent'}`}
        />
        <img src={mapIcon} alt="지도" className="w-6 h-6 object-contain" />
        <span className={`text-f12 ${isMap ? 'font-semibold text-navy' : 'text-navy-70'}`}>
          지도
        </span>
      </button>

      {/* 영토 */}
      <button
        onClick={() => navigate(ROUTES.TERRITORY)}
        className="flex-1 flex flex-col items-center py-2 gap-0.5 active:opacity-70 transition-opacity"
      >
        <span
          className={`w-1.5 h-1.5 rounded-full mb-0.5 ${isTerritory ? 'bg-navy' : 'bg-transparent'}`}
        />
        <img src={flagIcon} alt="영토" className="w-6 h-6 object-contain" />
        <span className={`text-f12 ${isTerritory ? 'font-semibold text-navy' : 'text-navy-70'}`}>
          영토
        </span>
      </button>

      {/* 랭킹 */}
      <button
        onClick={() => navigate(ROUTES.RANKING)}
        className="flex-1 flex flex-col items-center py-2 gap-0.5 active:opacity-70 transition-opacity"
        aria-current={isRanking ? 'page' : undefined}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full mb-0.5 ${isRanking ? 'bg-navy' : 'bg-transparent'}`}
        />
        <img src={rankingIcon} alt="랭킹" className="w-6 h-6 object-contain" />
        <span className={`text-f12 ${isRanking ? 'font-semibold text-navy' : 'text-navy-70'}`}>
          랭킹
        </span>
      </button>

      {/* 크루 */}
      <button
        onClick={() => navigate(ROUTES.CREW.INDEX)}
        className="flex-1 flex flex-col items-center py-2 gap-0.5 active:opacity-70 transition-opacity"
      >
        <span
          className={`w-1.5 h-1.5 rounded-full mb-0.5 ${isCrew ? 'bg-navy' : 'bg-transparent'}`}
        />
        <img src={crewIcon} alt="크루" className="w-8 h-8 object-contain" />
        <span className={`text-f12 ${isCrew ? 'font-semibold text-navy' : 'text-navy-70'}`}>
          크루
        </span>
      </button>

      {/* 마이 */}
      <button
        onClick={() => navigate(ROUTES.MY.INDEX)}
        className="flex-1 flex flex-col items-center py-2 gap-0.5 active:opacity-70 transition-opacity"
      >
        <span
          className={`w-1.5 h-1.5 rounded-full mb-0.5 ${isMy ? 'bg-navy' : 'bg-transparent'}`}
        />
        <img src={pawIcon} alt="마이" className="w-6 h-6 object-contain" />
        <span className={`text-f12 ${isMy ? 'font-semibold text-navy' : 'text-navy-70'}`}>
          마이
        </span>
      </button>
    </div>
  )
}
