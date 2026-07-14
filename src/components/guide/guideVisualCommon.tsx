import { motion } from 'framer-motion'

export const W = 360
export const H = 260

export function MapBg() {
  return (
    <>
      <rect width={W} height={H} fill="#1A2030" />
      <line x1="0" y1="190" x2={W} y2="150" stroke="#1E2C3E" strokeWidth="22" />
      <line x1="0" y1="82" x2={W} y2="82" stroke="#1E2C3E" strokeWidth="16" />
      <line x1="132" y1="0" x2="132" y2={H} stroke="#1E2C3E" strokeWidth="14" />
      <line x1="272" y1="0" x2="272" y2={H} stroke="#1E2C3E" strokeWidth="14" />
    </>
  )
}

export function XpBadge({
  x,
  y,
  delay = 0,
  label = '+50 XP',
}: {
  x: number
  y: number
  delay?: number
  label?: string
}) {
  return (
    <motion.g
      style={{ transformOrigin: `${x}px ${y}px` }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, type: 'spring', stiffness: 350, damping: 12 }}
    >
      <rect x={x - 40} y={y - 16} width={80} height={32} rx={16} fill="#CFBB7B" />
      <text
        x={x}
        y={y + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#1A2030"
        fontSize="13"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
      >
        {label}
      </text>
    </motion.g>
  )
}
