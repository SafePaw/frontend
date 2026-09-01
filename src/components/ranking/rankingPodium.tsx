import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { DEFAULT_MARKER_IMAGE_SRC, resolveMarkerImage } from '../../utils/markerImage'
import { formatRankingValue } from '../../utils/rankingFormat'
import goldMedal from '../../assets/goldmedal.png'
import silverMedal from '../../assets/silvermedal.png'
import bronzeMedal from '../../assets/bronzemedal.png'
import type { RankingItem } from '../../types/ranking'

const RANK_META = {
  1: {
    platformHeight: 72,
    avatarClass: 'w-14 h-14',
    platformColor: '#C9A227',
    label: '1위',
    medalSrc: goldMedal,
  },
  2: {
    platformHeight: 48,
    avatarClass: 'w-12 h-12',
    platformColor: '#8A8A8A',
    label: '2위',
    medalSrc: silverMedal,
  },
  3: {
    platformHeight: 36,
    avatarClass: 'w-11 h-11',
    platformColor: '#A0683A',
    label: '3위',
    medalSrc: bronzeMedal,
  },
} as const

function PodiumCard({ item, delay }: { item: RankingItem; delay: number }) {
  const [imgError, setImgError] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const markerSrc = imgError
    ? DEFAULT_MARKER_IMAGE_SRC
    : resolveMarkerImage({
        markerImageType: item.markerImageType,
        markerImageValue: item.markerImageValue,
        markerImageUrl: item.markerImageUrl,
      })
  const imgClass =
    item.markerImageType === 'UPLOADED'
      ? 'w-full h-full object-cover'
      : 'w-full h-full object-contain p-1'
  const meta = RANK_META[item.rank as 1 | 2 | 3]

  return (
    <motion.div
      className="flex flex-col items-center flex-1"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
    >
      <img src={meta.medalSrc} alt={`${meta.label} 메달`} className="w-7 h-7 object-contain mb-1" />

      <div
        className={`rounded-full overflow-hidden border-2 bg-cream flex items-center justify-center ${meta.avatarClass}`}
        style={{ borderColor: meta.platformColor }}
      >
        <img
          src={markerSrc}
          alt={`${item.dogName} 마커`}
          className={imgClass}
          onError={() => setImgError(true)}
        />
      </div>

      <p className="text-f12 font-semibold text-navy mt-1.5 truncate max-w-full px-1 text-center leading-tight">
        {item.dogName}
      </p>
      <p className="text-f12 text-navy-70 truncate max-w-full px-1 text-center">
        {formatRankingValue(item.value, item.unit)}
      </p>

      <div
        className="w-full mt-2 rounded-t-md flex items-center justify-center"
        style={{
          height: meta.platformHeight,
          backgroundColor: `${meta.platformColor}22`,
          borderTop: `2px solid ${meta.platformColor}44`,
        }}
      >
        <span className="text-f12 font-bold" style={{ color: meta.platformColor }}>
          {meta.label}
        </span>
      </div>
    </motion.div>
  )
}

interface RankingPodiumProps {
  items: RankingItem[]
}

export default function RankingPodium({ items }: RankingPodiumProps) {
  const first = items.find((i) => i.rank === 1)
  const second = items.find((i) => i.rank === 2)
  const third = items.find((i) => i.rank === 3)

  if (!first) return null

  const slots = [
    { item: second, delay: 0.1 },
    { item: first, delay: 0 },
    { item: third, delay: 0.2 },
  ]

  return (
    <div className="flex items-end gap-2 px-4 pt-4" aria-label="상위 3위">
      {slots.map(({ item, delay }, idx) =>
        item ? (
          <PodiumCard key={item.dogId} item={item} delay={delay} />
        ) : (
          <div key={`slot-${idx}`} className="flex-1" />
        ),
      )}
    </div>
  )
}
