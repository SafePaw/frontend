export interface TerritoryMarkerCoordinates {
  markerLng: number | null
  markerLat: number | null
}

export function isValidLngLat(lng: unknown, lat: unknown): boolean {
  return (
    typeof lng === 'number' &&
    typeof lat === 'number' &&
    Number.isFinite(lng) &&
    Number.isFinite(lat) &&
    lng >= -180 &&
    lng <= 180 &&
    lat >= -90 &&
    lat <= 90
  )
}

export function getTerritoryMarker(
  territory: TerritoryMarkerCoordinates & { status?: string },
): [number, number] | null {
  if (territory.status !== undefined && territory.status !== 'ACTIVE') return null
  const { markerLng, markerLat } = territory
  if (!isValidLngLat(markerLng, markerLat)) {
    if (import.meta.env?.DEV && territory.status === 'ACTIVE')
      console.warn('[SafePaw] ACTIVE territory has invalid marker coordinates', territory)
    return null
  }
  return [markerLng as number, markerLat as number]
}
