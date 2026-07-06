import { motion } from 'framer-motion'
import type { GuideVisualType } from '../../constants/guideSteps'
import { TERRITORY_COLORS } from '../../constants/territoryColors'
import { W, H, MapBg, XpBadge } from './guideVisualCommon'
import dogCaloriesImg from '../../assets/dogCalories.png'
import flagImg from '../../assets/flag.png'

function WalkControlsVisual() {
  const font = "'Pretendard Variable', Pretendard, sans-serif"
  const LW = W
  const LH = 482
  const panelY = 334
  const btnH = 50
  const btnRx = 8
  const px = 12
  const gap = 12

  // 산책 진행중: 일시정지(보조버튼), 산책 종료(메인)
  const aLeftW = 154
  const aRightX = px + aLeftW + gap
  const aRightW = LW - px - aRightX

  // 산책 일시정지: 재개(메인 버튼), 종료(보조버튼)
  const pLeftW = 170
  const pRightX = px + pLeftW + gap
  const pRightW = LW - px - pRightX

  const dur = 4.5
  const kTimes = [0, 0.38, 0.5, 0.88, 1.0]
  const aOp = [1, 1, 0, 0, 1]
  const pOp = [0, 0, 1, 1, 0]
  const rep = { duration: dur, times: kTimes, repeat: Infinity, ease: 'easeInOut' as const }

  const statLabelY = panelY + 38
  const statValueY = panelY + 62
  const divY = panelY + 76
  const btnY = panelY + 84
  const statColY1 = panelY + 26
  const statColY2 = panelY + 74

  return (
    <svg
      viewBox={`0 0 ${LW} ${LH}`}
      className="w-full h-full"
      preserveAspectRatio="xMidYMax meet"
      aria-hidden="true"
    >
      {/* 지도 */}
      <rect width={W} height={panelY + 14} fill="#1A2030" />
      <line x1="0" y1="64" x2={W} y2="64" stroke="#1E2C3E" strokeWidth="18" />
      <line x1="130" y1="0" x2="130" y2={panelY + 14} stroke="#1E2C3E" strokeWidth="14" />
      <polyline
        points="60,88 70,64 86,48 104,42 122,46 126,62 124,80"
        fill="none"
        stroke="#CFBB7B"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={60} cy={88} r={5} fill="#5AB07A" />
      <circle cx={124} cy={80} r={7} fill="#2A3244" stroke="#CFBB7B" strokeWidth="2" />

      {/* 활동 배지 */}
      <motion.g initial={{ opacity: 1 }} animate={{ opacity: aOp }} transition={rep}>
        <rect x={12} y={14} width={106} height={22} rx={11} fill="rgba(90,176,122,0.15)" />
        <text
          x={65}
          y={25}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#5AB07A"
          fontSize="10"
          fontFamily={font}
          fontWeight="500"
        >
          산책 중 ●
        </text>
      </motion.g>
      {/* 중지 배지 */}
      <motion.g initial={{ opacity: 0 }} animate={{ opacity: pOp }} transition={rep}>
        <rect x={12} y={14} width={106} height={22} rx={11} fill="rgba(42,50,68,0.28)" />
        <text
          x={65}
          y={25}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#8D9BB3"
          fontSize="10"
          fontFamily={font}
          fontWeight="500"
        >
          ⏸ 일시정지
        </text>
      </motion.g>
      {/* 타이머 */}
      <rect x={W - 78} y={14} width={66} height={22} rx={6} fill="rgba(26,26,26,0.85)" />
      <text
        x={W - 45}
        y={25}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#E8E0C8"
        fontSize="11"
        fontWeight="600"
        fontFamily={font}
      >
        18:32
      </text>

      <rect x={0} y={panelY} width={LW} height={LH - panelY} rx={16} fill="#FFFFFF" />
      <rect x={W / 2 - 20} y={panelY + 8} width={40} height={4} rx={2} fill="rgba(42,50,68,0.10)" />

      <line
        x1={120}
        y1={statColY1}
        x2={120}
        y2={statColY2}
        stroke="rgba(42,50,68,0.08)"
        strokeWidth={1}
      />
      <line
        x1={240}
        y1={statColY1}
        x2={240}
        y2={statColY2}
        stroke="rgba(42,50,68,0.08)"
        strokeWidth={1}
      />

      {/* 산책 시작 상태 */}
      <motion.g initial={{ opacity: 1 }} animate={{ opacity: aOp }} transition={rep}>
        <text
          x={60}
          y={statLabelY}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#8D9BB3"
          fontSize="10"
          fontFamily={font}
          fontWeight="300"
        >
          거리
        </text>
        <text
          x={60}
          y={statValueY}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#2A3244"
          fontSize="18"
          fontFamily={font}
          fontWeight="300"
        >
          2.4 km
        </text>
        <text
          x={180}
          y={statLabelY}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#8D9BB3"
          fontSize="10"
          fontFamily={font}
          fontWeight="300"
        >
          획득 영토
        </text>
        <text
          x={180}
          y={statValueY}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#2A3244"
          fontSize="18"
          fontFamily={font}
          fontWeight="300"
        >
          840 m²
        </text>
        <image href={dogCaloriesImg} x={277} y={statLabelY - 7} width={13} height={13} />
        <text
          x={293}
          y={statLabelY}
          textAnchor="start"
          dominantBaseline="middle"
          fill="#8D9BB3"
          fontSize="10"
          fontFamily={font}
          fontWeight="300"
        >
          칼로리
        </text>
        <text
          x={300}
          y={statValueY}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#2A3244"
          fontSize="18"
          fontFamily={font}
          fontWeight="300"
        >
          8 kcal
        </text>
      </motion.g>
      {/* 산책 일시중지 상태 */}
      <motion.g initial={{ opacity: 0 }} animate={{ opacity: pOp }} transition={rep}>
        <text
          x={60}
          y={statLabelY}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="rgba(141,155,179,0.5)"
          fontSize="10"
          fontFamily={font}
          fontWeight="300"
        >
          거리
        </text>
        <text
          x={60}
          y={statValueY}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="rgba(42,50,68,0.35)"
          fontSize="18"
          fontFamily={font}
          fontWeight="300"
        >
          2.4 km
        </text>
        <text
          x={180}
          y={statLabelY}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="rgba(141,155,179,0.5)"
          fontSize="10"
          fontFamily={font}
          fontWeight="300"
        >
          획득 영토
        </text>
        <text
          x={180}
          y={statValueY}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="rgba(42,50,68,0.35)"
          fontSize="18"
          fontFamily={font}
          fontWeight="300"
        >
          840 m²
        </text>
        <image
          href={dogCaloriesImg}
          x={277}
          y={statLabelY - 7}
          width={13}
          height={13}
          style={{ opacity: 0.5 }}
        />
        <text
          x={292}
          y={statLabelY}
          textAnchor="start"
          dominantBaseline="middle"
          fill="rgba(141,155,179,0.5)"
          fontSize="10"
          fontFamily={font}
          fontWeight="300"
        >
          칼로리
        </text>
        <text
          x={300}
          y={statValueY}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="rgba(42,50,68,0.35)"
          fontSize="18"
          fontFamily={font}
          fontWeight="300"
        >
          8 kcal
        </text>
      </motion.g>

      <line x1={px} y1={divY} x2={W - px} y2={divY} stroke="rgba(42,50,68,0.08)" strokeWidth={1} />

      {/* 재개버튼 */}
      <motion.g initial={{ opacity: 1 }} animate={{ opacity: aOp }} transition={rep}>
        <rect x={px} y={btnY} width={aLeftW} height={btnH} rx={btnRx} fill="rgba(42,50,68,0.08)" />
        <text
          x={px + aLeftW / 2}
          y={btnY + btnH / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#4E5F7A"
          fontSize="13"
          fontFamily={font}
          fontWeight="400"
        >
          ⏸ 일시정지
        </text>
        <rect x={aRightX} y={btnY} width={aRightW} height={btnH} rx={btnRx} fill="#2A3244" />
        <image href={flagImg} x={226} y={btnY + btnH / 2 - 9} width={18} height={18} />
        <text
          x={248}
          y={btnY + btnH / 2}
          textAnchor="start"
          dominantBaseline="middle"
          fill="#FFFFFF"
          fontSize="13"
          fontFamily={font}
          fontWeight="500"
        >
          산책 종료
        </text>
      </motion.g>
      {/* 일시정지 */}
      <motion.g initial={{ opacity: 0 }} animate={{ opacity: pOp }} transition={rep}>
        <rect x={px} y={btnY} width={pLeftW} height={btnH} rx={btnRx} fill="#2A3244" />
        <text
          x={px + pLeftW / 2}
          y={btnY + btnH / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#FFFFFF"
          fontSize="13"
          fontFamily={font}
          fontWeight="500"
        >
          ▶ 재개하기
        </text>
        <rect
          x={pRightX}
          y={btnY}
          width={pRightW}
          height={btnH}
          rx={btnRx}
          fill="rgba(42,50,68,0.08)"
          stroke="rgba(42,50,68,0.15)"
          strokeWidth={1}
        />
        <image
          href={flagImg}
          x={247}
          y={btnY + btnH / 2 - 9}
          width={18}
          height={18}
          style={{ opacity: 0.6 }}
        />
        <text
          x={269}
          y={btnY + btnH / 2}
          textAnchor="start"
          dominantBaseline="middle"
          fill="#4E5F7A"
          fontSize="13"
          fontFamily={font}
          fontWeight="400"
        >
          종료
        </text>
      </motion.g>
    </svg>
  )
}

function WalkStatsVisual() {
  const VW = 390
  const VH = 580
  const sheetY = 390
  const font = "'Pretendard Variable', Pretendard, sans-serif"

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      className="w-full h-full"
      preserveAspectRatio="xMidYMin slice"
      aria-hidden="true"
    >
      {/* 지도 */}
      <rect width={VW} height={VH} fill="#1A2030" />
      <line x1="130" y1="0" x2="130" y2={sheetY} stroke="#1E2C3E" strokeWidth="22" />
      <line x1="260" y1="0" x2="260" y2={sheetY} stroke="#1E2C3E" strokeWidth="22" />
      <line x1="0" y1="200" x2={VW} y2="200" stroke="#1E2C3E" strokeWidth="20" />

      <motion.polygon
        points="55,370 82,145 235,122 308,258 268,378 90,382"
        fill={TERRITORY_COLORS[4].hex}
        fillOpacity="0.22"
        stroke={TERRITORY_COLORS[4].hex}
        strokeWidth="1.5"
        strokeOpacity="0.5"
        style={{ transformOrigin: '172px 264px' }}
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
      />

      <motion.path
        d="M 148,348 C 175,318 200,268 224,238 S 258,224 272,238"
        fill="none"
        stroke="#CFBB7B"
        strokeWidth="4"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          pathLength: { delay: 0.8, duration: 1.4, ease: 'easeInOut' },
          opacity: { duration: 0.01, delay: 0.8 },
        }}
      />

      <motion.circle
        cx={148}
        cy={348}
        r={8}
        fill="#4B6D41"
        style={{ transformOrigin: '148px 348px' }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.7, type: 'spring', stiffness: 400 }}
      />
      <motion.circle
        cx={272}
        cy={238}
        r={30}
        fill="rgba(207,187,123,0.14)"
        style={{ transformOrigin: '272px 238px' }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2.1, duration: 0.3 }}
      />
      <motion.circle
        cx={272}
        cy={238}
        r={16}
        fill="#CFBB7B"
        style={{ transformOrigin: '272px 238px' }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2.0, type: 'spring', stiffness: 350 }}
      />

      <rect x={12} y={16} width={114} height={30} rx={15} fill="#243040" />
      <circle cx={29} cy={31} r={5} fill="#5AB07A" />
      <text
        x={72}
        y={31}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#8D9BB3"
        fontSize="13"
        fontFamily={font}
        fontWeight="300"
      >
        산책 중 ●
      </text>
      <rect x={264} y={16} width={114} height={30} rx={15} fill="#1E2C3E" />
      <text
        x={321}
        y={31}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#E8E0C8"
        fontSize="15"
        fontWeight="600"
        fontFamily={font}
      >
        42:15
      </text>

      <rect x={0} y={sheetY} width={VW} height={24} rx={22} fill="#1E2C3E" />
      <rect x={0} y={sheetY + 12} width={VW} height={VH - sheetY - 12} fill="#1E2C3E" />

      <rect x={175} y={sheetY + 10} width={40} height={5} rx={2.5} fill="#2A3848" />

      <line x1="130" y1={sheetY + 36} x2="130" y2={sheetY + 108} stroke="#263040" strokeWidth="1" />
      <line x1="260" y1={sheetY + 36} x2="260" y2={sheetY + 108} stroke="#263040" strokeWidth="1" />

      <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.3 }}>
        <text
          x={65}
          y={sheetY + 48}
          textAnchor="middle"
          fill="#4E5F7A"
          fontSize="12"
          fontFamily={font}
          fontWeight="300"
        >
          거리
        </text>
        <text x={65} y={sheetY + 88} textAnchor="middle" fontFamily={font}>
          <tspan fill="#CFBB7B" fontSize="26" fontWeight="300">
            2.4
          </tspan>
          <tspan fill="#4E5F7A" fontSize="15" fontWeight="200">
            {' '}
            km
          </tspan>
        </text>

        <text
          x={195}
          y={sheetY + 48}
          textAnchor="middle"
          fill="#4E5F7A"
          fontSize="12"
          fontFamily={font}
          fontWeight="300"
        >
          획득 영토
        </text>
        <text x={195} y={sheetY + 88} textAnchor="middle" fontFamily={font}>
          <tspan fill="#CFBB7B" fontSize="26" fontWeight="300">
            840
          </tspan>
          <tspan fill="#4E5F7A" fontSize="15" fontWeight="200">
            {' '}
            m²
          </tspan>
        </text>

        <image href={dogCaloriesImg} x={299} y={sheetY + 41} width={13} height={13} />
        <text
          x={315}
          y={sheetY + 48}
          textAnchor="start"
          dominantBaseline="middle"
          fill="#4E5F7A"
          fontSize="12"
          fontFamily={font}
          fontWeight="300"
        >
          칼로리
        </text>
        <text x={325} y={sheetY + 88} textAnchor="middle" fontFamily={font}>
          <tspan fill="#CFBB7B" fontSize="26" fontWeight="300">
            8
          </tspan>
          <tspan fill="#4E5F7A" fontSize="15" fontWeight="200">
            {' '}
            kcal
          </tspan>
        </text>
      </motion.g>

      <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}>
        <rect
          x={12}
          y={sheetY + 118}
          width={174}
          height={54}
          rx={27}
          fill="#243040"
          stroke="#2A3848"
          strokeWidth="1"
        />
        <text
          x={99}
          y={sheetY + 145}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#8D9BB3"
          fontSize="16"
          fontFamily={font}
          fontWeight="400"
        >
          ⏸ 일시정지
        </text>
        <rect x={204} y={sheetY + 118} width={174} height={54} rx={27} fill="#CFBB7B" />
        <image href={flagImg} x={248} y={sheetY + 136} width={18} height={18} />
        <text
          x={270}
          y={sheetY + 145}
          textAnchor="start"
          dominantBaseline="middle"
          fill="#1A2030"
          fontSize="16"
          fontWeight="600"
          fontFamily={font}
        >
          산책 종료
        </text>
      </motion.g>
    </svg>
  )
}

function WalkTerritoryVisual() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" aria-hidden="true">
      <MapBg />
      <motion.polygon
        points="86,70 214,56 280,154 244,222 92,226 46,146"
        fill={TERRITORY_COLORS[4].hex}
        fillOpacity="0.35"
        stroke={TERRITORY_COLORS[4].hex}
        strokeWidth="2.5"
        strokeOpacity="0.8"
        style={{ transformOrigin: '163px 143px' }}
        initial={{ scale: 0.25, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.85, ease: [0.34, 1.56, 0.64, 1] }}
      />
      <XpBadge x={163} y={143} delay={1.3} label="+80 XP" />
      <motion.g
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.1 }}
      >
        <rect x={62} y={228} width={236} height={26} rx={13} fill="#1E2C3E" />
        <text
          x={180}
          y={241}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#8D9BB3"
          fontSize="11"
          fontFamily="system-ui, sans-serif"
        >
          미충족 시에도 산책 기록 + XP
        </text>
      </motion.g>
    </svg>
  )
}

const VISUAL_MAP: Partial<Record<GuideVisualType, () => JSX.Element>> = {
  walkControls: WalkControlsVisual,
  walkStats: WalkStatsVisual,
  walkTerritory: WalkTerritoryVisual,
}

export default function GuideVisual({ type }: { type: GuideVisualType }) {
  const Visual = VISUAL_MAP[type]
  if (!Visual) return null
  return (
    <div className="w-full h-full flex items-center justify-center">
      <Visual />
    </div>
  )
}
