import { motion } from 'framer-motion'
import type { GuideVisualType } from '../../constants/guideSteps'
import { TERRITORY_COLORS } from '../../constants/territoryColors'
import { W, H, MapBg, XpBadge } from './guideVisualCommon'
import mixDog from '../../assets/preset/mix.png'
import malteseImg from '../../assets/preset/maltese.png'

function WalkPathVisual() {
  const loop =
    'M 110,196 C 150,178 200,158 246,134 C 272,118 278,88 264,58 C 252,36 202,28 154,38 C 110,48 76,86 68,128 C 62,164 70,196 88,212'

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" aria-hidden="true">
      <MapBg />

      <motion.polygon
        points="110,196 200,158 264,58 154,38 68,128 88,212"
        fill={TERRITORY_COLORS[7].hex}
        fillOpacity="0.22"
        stroke="none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.7, duration: 0.55 }}
      />

      <motion.path
        d={loop}
        fill="none"
        stroke="#CFBB7B"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          pathLength: { duration: 2.1, ease: 'easeInOut', delay: 0.4 },
          opacity: { duration: 0.05 },
        }}
      />

      <motion.circle
        cx={110}
        cy={196}
        r={11}
        fill="#CFBB7B"
        stroke="#1A2030"
        strokeWidth="2"
        style={{ transformOrigin: '110px 196px' }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.25, type: 'spring', stiffness: 320 }}
      />
      <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <rect x={124} y={188} width={50} height={18} rx={9} fill="#1E2C3E" />
        <text
          x={149}
          y={197}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#CFBB7B"
          fontSize="10"
          fontWeight="700"
          fontFamily="system-ui, sans-serif"
        >
          시작
        </text>
      </motion.g>

      <motion.circle
        cx={88}
        cy={212}
        r={11}
        fill="#D56231"
        stroke="#1A2030"
        strokeWidth="2"
        style={{ transformOrigin: '88px 212px' }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2.15, type: 'spring', stiffness: 420, damping: 14 }}
      />
      <motion.g
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.3 }}
      >
        <rect x={68} y={226} width={40} height={18} rx={9} fill="#1E2C3E" />
        <text
          x={88}
          y={235}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#D56231"
          fontSize="10"
          fontWeight="700"
          fontFamily="system-ui, sans-serif"
        >
          끝
        </text>
      </motion.g>
    </svg>
  )
}

function TerritoryStackVisual() {
  const territories = [
    {
      points: '100,75 205,60 255,148 215,212 130,216 80,148',
      color: TERRITORY_COLORS[1].hex,
      delay: 0.3,
      cx: 164,
      cy: 138,
    },
    {
      points: '55,122 160,102 210,184 170,244 78,250 35,188',
      color: TERRITORY_COLORS[4].hex,
      delay: 0.85,
      cx: 118,
      cy: 182,
    },
    {
      points: '185,55 295,48 328,138 290,202 194,210 150,142',
      color: TERRITORY_COLORS[5].hex,
      delay: 1.4,
      cx: 240,
      cy: 133,
    },
  ]
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" aria-hidden="true">
      <MapBg />
      {territories.map((t, i) => (
        <motion.polygon
          key={i}
          points={t.points}
          fill={t.color}
          fillOpacity="0.32"
          stroke={t.color}
          strokeWidth="2"
          strokeOpacity="0.65"
          style={{ transformOrigin: `${t.cx}px ${t.cy}px` }}
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: t.delay, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        />
      ))}
      <XpBadge x={183} y={128} delay={2.1} label="+120 XP" />
    </svg>
  )
}

function TerritoryBattleVisual() {
  const myColor = TERRITORY_COLORS[4].hex
  const oppColor = TERRITORY_COLORS[1].hex

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" aria-hidden="true">
      <MapBg />

      <motion.polygon
        points="168,62 288,54 315,160 268,226 150,230 112,152"
        fill={oppColor}
        fillOpacity="0.3"
        stroke={oppColor}
        strokeWidth="2"
        strokeOpacity="0.6"
        style={{ transformOrigin: '217px 147px' }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1, 0.78], opacity: [0, 0.85, 0.4] }}
        transition={{ delay: 0.2, duration: 1.5, times: [0, 0.38, 1] }}
      />

      <motion.g
        style={{ transformOrigin: '217px 147px' }}
        animate={{ scale: [0, 1.15, 1, 1, 0], opacity: [0, 1, 1, 1, 0] }}
        transition={{ delay: 0.4, duration: 1.4, times: [0, 0.12, 0.3, 0.65, 1] }}
      >
        <circle cx={217} cy={147} r={25} fill={oppColor} />
        <image
          href={malteseImg}
          x={193}
          y={123}
          width={48}
          height={48}
          preserveAspectRatio="xMidYMid slice"
          style={{ clipPath: 'circle(24px at 24px 24px)' }}
        />
        <circle
          cx={217}
          cy={147}
          r={25}
          fill="none"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1.5"
        />
      </motion.g>

      <motion.polygon
        points="52,68 184,52 226,168 182,238 60,242 24,152"
        fill={myColor}
        fillOpacity="0.4"
        stroke={myColor}
        strokeWidth="2.5"
        strokeOpacity="0.85"
        style={{ transformOrigin: '126px 148px' }}
        initial={{ scale: 0.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.9, ease: [0.34, 1.56, 0.64, 1] }}
      />

      <motion.g
        style={{ transformOrigin: '126px 148px' }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.32, 1.0], opacity: [0, 1, 1] }}
        transition={{ delay: 1.75, duration: 0.5, times: [0, 0.55, 1], ease: 'easeOut' }}
      >
        <circle cx={126} cy={148} r={25} fill={myColor} />
        <image
          href={mixDog}
          x={102}
          y={124}
          width={48}
          height={48}
          preserveAspectRatio="xMidYMid slice"
          style={{ clipPath: 'circle(24px at 24px 24px)' }}
        />
        <circle
          cx={126}
          cy={148}
          r={25}
          fill="none"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1.5"
        />
      </motion.g>
    </svg>
  )
}

const VISUAL_MAP: Partial<Record<GuideVisualType, () => JSX.Element>> = {
  walkPath: WalkPathVisual,
  territoryStack: TerritoryStackVisual,
  territoryBattle: TerritoryBattleVisual,
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
