import { formatTerritory } from './rankingFormat'

export function clampContributionPercent(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return null
  return Math.min(value, 100)
}

export function formatContributionPercent(value: unknown): string {
  const percent = clampContributionPercent(value)
  return percent === null ? '—' : `${percent}%`
}

export function formatContributionArea(value: unknown): string {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return '—'
  return formatTerritory(value)
}
