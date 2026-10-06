import { isValidLngLat } from './territoryMarker'
import type { TerritorySummary } from '../types/territory'
import type { TerritoryPolygon } from '../types/territory'
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

export function hasValidCoords(polygon: TerritoryPolygon): boolean {
  if (!polygon || !Array.isArray(polygon.coordinates)) return false
  const polygons =
    polygon.type === 'Polygon'
      ? [polygon.coordinates]
      : polygon.type === 'MultiPolygon'
        ? polygon.coordinates
        : []
  return (
    polygons.length > 0 &&
    polygons.every(
      (rings) =>
        Array.isArray(rings) &&
        rings.length > 0 &&
        rings.every(
          (ring) =>
            Array.isArray(ring) &&
            ring.length >= 4 &&
            ring.every((coord) => Array.isArray(coord) && isValidLngLat(coord[0], coord[1])) &&
            ring[0][0] === ring[ring.length - 1][0] &&
            ring[0][1] === ring[ring.length - 1][1],
        ),
    )
  )
}

export function toTerritoryFeatureCollection(territories: TerritorySummary[]) {
  const features = []

  for (const territory of territories) {
    const polygon = territory.polygon

    if (!polygon || !hasValidCoords(polygon)) {
      if (polygon && import.meta.env?.DEV) {
        console.warn('[SafePaw] 빈 좌표 영토 제외 id:', territory.id)
      }
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
      geometry: polygon,
    })
  }

  return {
    type: 'FeatureCollection' as const,
    features,
  }
}

export function computeTerritoryBounds(
  territories: { polygon: TerritoryPolygon | null }[],
): [[number, number], [number, number]] | null {
  let minLng = Infinity,
    maxLng = -Infinity
  let minLat = Infinity,
    maxLat = -Infinity
  let hasCoords = false

  for (const territory of territories) {
    const polygon = territory.polygon
    if (!polygon || !hasValidCoords(polygon)) continue

    let rings: [number, number][][]
    if (polygon.type === 'Polygon') {
      rings = polygon.coordinates as [number, number][][]
    } else {
      rings = polygon.coordinates.flat() as [number, number][][]
    }

    for (const ring of rings) {
      for (const coord of ring) {
        const [lng, lat] = coord
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

export function computePolygonBounds(
  polygon: TerritoryPolygon,
): [[number, number], [number, number]] | null {
  return computeTerritoryBounds([{ polygon }])
}
