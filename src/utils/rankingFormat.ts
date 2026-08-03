import type { RankingUnit } from '../types/ranking'

export function formatXp(value: number): string {
  return `${Math.round(value).toLocaleString()} XP`
}

export function formatDistance(value: number): string {
  return value < 1000 ? `${Math.round(value)}m` : `${(value / 1000).toFixed(2)}km`
}

export function formatDuration(value: number): string {
  const h = Math.floor(value / 3600)
  const m = Math.floor((value % 3600) / 60)
  const s = Math.floor(value % 60)
  if (h > 0) return `${h}시간 ${m}분`
  if (m > 0) return `${m}분 ${s}초`
  return `${s}초`
}

export function formatTerritory(value: number): string {
  return `${Math.round(value).toLocaleString()}㎡`
}

export function formatRankingValue(value: number, unit: RankingUnit): string {
  switch (unit) {
    case 'xp':
      return formatXp(value)
    case 'm':
      return formatDistance(value)
    case 'seconds':
      return formatDuration(value)
    case 'm2':
      return formatTerritory(value)
  }
}
