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

function hasValidCoords(polygon: TerritoryPolygon): boolean {
  if (polygon.type === 'Polygon') {
    return polygon.coordinates.length > 0 && (polygon.coordinates[0]?.length ?? 0) > 0
  }
  return (
    polygon.coordinates.length > 0 &&
    (polygon.coordinates[0]?.length ?? 0) > 0 &&
    (polygon.coordinates[0]?.[0]?.length ?? 0) > 0
  )
}

export function toTerritoryFeatureCollection(territories: TerritorySummary[]) {
  const features = []

  for (const territory of territories) {
    const polygon = territory.polygon

    if (!polygon || !hasValidCoords(polygon)) {
      if (polygon) {
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
  territories: TerritorySummary[],
): [[number, number], [number, number]] | null {
  let minLng = Infinity,
    maxLng = -Infinity
  let minLat = Infinity,
    maxLat = -Infinity
  let hasCoords = false

  for (const territory of territories) {
    const polygon = territory.polygon
    if (!polygon) continue

    let rings: [number, number][][]
    if (polygon.type === 'Polygon') {
      rings = polygon.coordinates as [number, number][][]
    } else {
      rings = polygon.coordinates.flat() as [number, number][][]
    }

    for (const ring of rings) {
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

function computeRingCentroid(ring: [number, number][]): {
  lng: number
  lat: number
  absArea: number
} {
  const n = ring.length
  if (n === 0) return { lng: 0, lat: 0, absArea: 0 }
  if (n === 1) return { lng: ring[0][0], lat: ring[0][1], absArea: 0 }

  let area = 0
  let cx = 0
  let cy = 0
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    const cross = ring[i][0] * ring[j][1] - ring[j][0] * ring[i][1]
    area += cross
    cx += (ring[i][0] + ring[j][0]) * cross
    cy += (ring[i][1] + ring[j][1]) * cross
  }
  area /= 2
  const absArea = Math.abs(area)
  if (absArea < 1e-10) {
    const sumLng = ring.reduce((s, c) => s + c[0], 0)
    const sumLat = ring.reduce((s, c) => s + c[1], 0)
    return { lng: sumLng / n, lat: sumLat / n, absArea: 0 }
  }
  return { lng: cx / (6 * area), lat: cy / (6 * area), absArea }
}

export function computeGeometryCentroid(geometry: TerritoryPolygon): [number, number] {
  if (geometry.type === 'Polygon') {
    const ring = geometry.coordinates[0] as [number, number][]
    if (!ring?.length) return [0, 0]
    const { lng, lat } = computeRingCentroid(ring)
    return [lng, lat]
  }

  let totalArea = 0
  let totalLng = 0
  let totalLat = 0
  for (const polygonCoords of geometry.coordinates) {
    const ring = polygonCoords[0] as [number, number][]
    if (!ring?.length) continue
    const { lng, lat, absArea } = computeRingCentroid(ring)
    totalArea += absArea
    totalLng += lng * absArea
    totalLat += lat * absArea
  }

  if (totalArea < 1e-10) {
    for (const polygonCoords of geometry.coordinates) {
      const ring = polygonCoords[0] as [number, number][]
      if (ring?.length) {
        const sum = ring.reduce(([sLng, sLat], [lng, lat]) => [sLng + lng, sLat + lat], [0, 0])
        return [sum[0] / ring.length, sum[1] / ring.length]
      }
    }
    return [0, 0]
  }

  return [totalLng / totalArea, totalLat / totalArea]
}
