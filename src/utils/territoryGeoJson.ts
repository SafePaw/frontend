import type { TerritorySummary } from '../types/territory'
import { DEFAULT_TERRITORY_COLOR_HEX } from '../constants/territoryColors'

export interface TerritoryFeatureProperties {
  territoryId: number
  color: string
  isMine: boolean
  status: string
}

function isValidHexColor(color: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color)
}

export function toTerritoryFeatureCollection(territories: TerritorySummary[]) {
  const features = []

  for (const territory of territories) {
    const polygon = territory.polygon

    if (!polygon || polygon.type !== 'Polygon') {
      if (polygon) {
        console.warn(
          '[SafePaw] 예상하지 못한 geometry type:',
          (polygon as { type: string }).type,
          '영토 id:',
          territory.id,
        )
      }
      continue
    }

    if (!polygon.coordinates.length || !polygon.coordinates[0]?.length) {
      console.warn('[SafePaw] 빈 좌표 영토 제외 id:', territory.id)
      continue
    }

    const color = isValidHexColor(territory.dog.territoryColor)
      ? territory.dog.territoryColor
      : DEFAULT_TERRITORY_COLOR_HEX

    features.push({
      type: 'Feature' as const,
      properties: {
        territoryId: territory.id,
        color,
        isMine: territory.isMine,
        status: territory.status,
      } satisfies TerritoryFeatureProperties,
      geometry: {
        type: 'Polygon' as const,
        coordinates: polygon.coordinates as number[][][],
      },
    })
  }

  return {
    type: 'FeatureCollection' as const,
    features,
  }
}

export function computeTerritoryBounds(
  territories: TerritorySummary[],
): [[number, number], [number, number]] | null {
  let minLng = Infinity,
    maxLng = -Infinity
  let minLat = Infinity,
    maxLat = -Infinity
  let hasCoords = false

  for (const territory of territories) {
    if (!territory.polygon?.coordinates) continue
    for (const ring of territory.polygon.coordinates) {
      for (const coord of ring) {
        const [lng, lat] = coord
        if (typeof lng !== 'number' || typeof lat !== 'number') continue
        hasCoords = true
        if (lng < minLng) minLng = lng
        if (lng > maxLng) maxLng = lng
        if (lat < minLat) minLat = lat
        if (lat > maxLat) maxLat = lat
      }
    }
  }

  if (!hasCoords) return null
  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ]
}
