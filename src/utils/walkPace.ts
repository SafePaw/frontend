export function formatPace(
  durationSeconds: number | null | undefined,
  distanceMeters: number | null | undefined,
): string {
  if (
    typeof durationSeconds !== 'number' ||
    typeof distanceMeters !== 'number' ||
    !Number.isFinite(durationSeconds) ||
    !Number.isFinite(distanceMeters) ||
    durationSeconds <= 0 ||
    distanceMeters <= 0
  )
    return '—'
  const seconds = Math.round(durationSeconds / (distanceMeters / 1000))
  if (!Number.isFinite(seconds) || seconds <= 0) return '—'
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')} /km`
}
