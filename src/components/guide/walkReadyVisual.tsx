import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import type { GuideVisualType } from '../../constants/guideSteps'
import { TERRITORY_COLORS } from '../../constants/territoryColors'
import { W, H, MapBg, XpBadge } from './guideVisualCommon'

function GpsRuleVisual() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" aria-hidden="true">
      <MapBg />
      <motion.path
        d="M 55,222 C 92,202 128,182 170,160 S 230,134 274,118"
        fill="none"
        stroke="#CFBB7B"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          pathLength: { duration: 1.8, ease: 'easeInOut', delay: 0.3 },
          opacity: { duration: 0.05 },
        }}
      />
      <motion.circle
        cx={55}
        cy={222}
        r={8}
        fill="#4B6D41"
        style={{ transformOrigin: '55px 222px' }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
      />
      <motion.circle
        cx={274}
        cy={118}
        r={22}
        fill="4B6D41"
        fillOpacity="0.12"
        stroke="#4B6D41"
        strokeWidth="1.5"
        strokeOpacity="0.5"
        strokeDasharray="4 3"
        style={{ transformOrigin: '274px 118px' }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.4 }}
      />
      <motion.circle
        cx={274}
        cy={118}
        r={7}
        fill="#4B6D41"
        style={{ transformOrigin: '274px 118px' }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.5, type: 'spring', stiffness: 400 }}
      />
      <motion.g
        style={{ transformOrigin: '138px 66px' }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2.0, type: 'spring', stiffness: 300 }}
      ></motion.g>
      <XpBadge x={165} y={128} delay={2.35} label="+30 XP" />
    </svg>
  )
}

function LoopRuleVisual() {
  const x1 = 75,
    y1 = 57,
    x2 = 285,
    y2 = 197
  const cx = (x1 + x2) / 2
  const cy = (y1 + y2) / 2
  const loop = `M ${x1},${y2} L ${x1},${y1} L ${x2},${y1} L ${x2},${y2} Z`
  const dimColor = '#6CABDD'
  const tickLen = 6

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" aria-hidden="true">
      <MapBg />

      <motion.rect
        x={x1}
        y={y1}
        width={x2 - x1}
        height={y2 - y1}
        fill={TERRITORY_COLORS[4].hex}
        fillOpacity="0.18"
        stroke="none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 0.5 }}
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
          pathLength: { duration: 2.0, ease: 'easeInOut', delay: 0.3 },
          opacity: { duration: 0.05 },
        }}
      />

      <motion.circle
        cx={x1}
        cy={y2}
        r={9}
        fill="#CFBB7B"
        style={{ transformOrigin: `${x1}px ${y2}px` }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
      />

      <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.3 }}>
        <line x1={x1} y1={y2 + 18} x2={x2} y2={y2 + 18} stroke={dimColor} strokeWidth="1.2" />
        <line
          x1={x1}
          y1={y2 + 18 - tickLen}
          x2={x1}
          y2={y2 + 18 + tickLen}
          stroke={dimColor}
          strokeWidth="1.2"
        />
        <line
          x1={x2}
          y1={y2 + 18 - tickLen}
          x2={x2}
          y2={y2 + 18 + tickLen}
          stroke={dimColor}
          strokeWidth="1.2"
        />
        <line x1={x1 + 6} y1={y2 + 14} x2={x1} y2={y2 + 18} stroke={dimColor} strokeWidth="1.2" />
        <line x1={x1 + 6} y1={y2 + 22} x2={x1} y2={y2 + 18} stroke={dimColor} strokeWidth="1.2" />
        <line x1={x2 - 6} y1={y2 + 14} x2={x2} y2={y2 + 18} stroke={dimColor} strokeWidth="1.2" />
        <line x1={x2 - 6} y1={y2 + 22} x2={x2} y2={y2 + 18} stroke={dimColor} strokeWidth="1.2" />
        <rect x={cx - 46} y={y2 + 28} width={92} height={22} rx={11} fill="#1E2C3E" />
        <text
          x={cx}
          y={y2 + 39}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={dimColor}
          fontSize="11"
          fontWeight="700"
          fontFamily="system-ui, sans-serif"
        >
          폭 15m 이상
        </text>
      </motion.g>

      <motion.g
        style={{ transformOrigin: `${cx}px ${cy}px` }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2.6, type: 'spring', stiffness: 300 }}
      >
        <rect x={cx - 58} y={cy - 16} width={116} height={32} rx={16} fill="#243040" />
        <text
          x={cx}
          y={cy + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#8D9BB3"
          fontSize="11"
          fontFamily="system-ui, sans-serif"
        >
          넓이 100m² 이상
        </text>
      </motion.g>
    </svg>
  )
}

function DailyLimitVisual() {
  const hourRef = useRef<SVGRectElement>(null)
  const minuteRef = useRef<SVGRectElement>(null)

  useEffect(() => {
    let rafId: number
    let startTime: number | null = null
    const DELAY = 1100
    const DURATION = 3000

    const tick = (ts: number) => {
      if (startTime === null) startTime = ts
      const elapsed = ts - startTime - DELAY
      if (elapsed > 0) {
        const h = ((elapsed / DURATION) * 360) % 360
        const m = ((elapsed / DURATION) * 720) % 360
        hourRef.current?.setAttribute('transform', `rotate(${h}, 175, 145)`)
        minuteRef.current?.setAttribute('transform', `rotate(${m}, 175, 145)`)
      }
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [])

  const ticks = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * 30 - 90) * (Math.PI / 180)
    const r = 44
    const isMajor = i % 3 === 0
    const len = isMajor ? 8 : 5
    return { angle, r, len, isMajor, delay: 0.72 + i * 0.03 }
  })

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" aria-hidden="true">
      <MapBg />
      <motion.polygon
        points="74,70 206,56 274,150 238,220 92,224 46,148"
        fill="#D45C5C"
        fillOpacity="0.22"
        stroke="#D45C5C"
        strokeWidth="1.5"
        strokeOpacity="0.48"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      />
      <motion.circle
        cx={175}
        cy={145}
        r={52}
        fill="#1A2030"
        stroke="#CFBB7B"
        strokeWidth="2.5"
        style={{ transformOrigin: '175px 145px' }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 240 }}
      />
      {ticks.map((t, i) => (
        <motion.line
          key={i}
          x1={175 + t.r * Math.cos(t.angle)}
          y1={145 + t.r * Math.sin(t.angle)}
          x2={175 + (t.r - t.len) * Math.cos(t.angle)}
          y2={145 + (t.r - t.len) * Math.sin(t.angle)}
          stroke="#CFBB7B"
          strokeWidth={t.isMajor ? 2 : 1}
          strokeOpacity={t.isMajor ? 0.7 : 0.38}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: t.delay }}
        />
      ))}
      <motion.text
        x={175}
        y={132}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#CFBB7B"
        fontSize="14"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0 }}
      >
        24h
      </motion.text>
      <rect ref={hourRef} x={173.25} y={116} width={3.5} height={29} rx={1.75} fill="#CFBB7B" />
      <rect ref={minuteRef} x={174} y={106} width={2} height={39} rx={1} fill="#CFBB7B" />
      <circle cx={175} cy={145} r={4} fill="#CFBB7B" />
    </svg>
  )
}

const VISUAL_MAP: Partial<Record<GuideVisualType, () => JSX.Element>> = {
  gpsRule: GpsRuleVisual,
  loopRule: LoopRuleVisual,
  dailyLimit: DailyLimitVisual,
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
