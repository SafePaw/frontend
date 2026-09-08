import type { TerritoryPolygon } from '../types/territory'
import { computePolygonBounds, computeGeometryCentroid } from './territoryGeoJson'

const VIEW_SIZE = 320
const PADDING = 32

interface Point {
  x: number
  y: number
}

interface ProjectionCtx {
  offsetX: number
  offsetY: number
  scale: number
  minLng: number
  minLat: number
  projH: number
}

function buildBounds(
  route: [number, number][] | null,
  territory: TerritoryPolygon | null,
): { minLng: number; maxLng: number; minLat: number; maxLat: number } | null {
  let minLng = Infinity,
    maxLng = -Infinity
  let minLat = Infinity,
    maxLat = -Infinity
  let hasCoords = false

  function expand(lng: number, lat: number) {
    hasCoords = true
    if (lng < minLng) minLng = lng
    if (lng > maxLng) maxLng = lng
    if (lat < minLat) minLat = lat
    if (lat > maxLat) maxLat = lat
  }

  if (route) {
    for (const [lng, lat] of route) expand(lng, lat)
  }

  if (territory) {
    const b = computePolygonBounds(territory)
    if (b) {
      expand(b[0][0], b[0][1])
      expand(b[1][0], b[1][1])
    }
  }

  if (!hasCoords) return null
  return { minLng, maxLng, minLat, maxLat }
}

function makeProjection(bounds: {
  minLng: number
  maxLng: number
  minLat: number
  maxLat: number
}): ProjectionCtx {
  const usable = VIEW_SIZE - PADDING * 2
  const lngSpan = Math.max(bounds.maxLng - bounds.minLng, 1e-8)
  const latSpan = Math.max(bounds.maxLat - bounds.minLat, 1e-8)

  const scale = Math.min(usable / lngSpan, usable / latSpan)
  const projW = lngSpan * scale
  const projH = latSpan * scale
  const offsetX = PADDING + (usable - projW) / 2
  const offsetY = PADDING + (usable - projH) / 2

  return { offsetX, offsetY, scale, minLng: bounds.minLng, minLat: bounds.minLat, projH }
}

function project(lng: number, lat: number, ctx: ProjectionCtx): Point {
  return {
    x: ctx.offsetX + (lng - ctx.minLng) * ctx.scale,
    y: ctx.offsetY + ctx.projH - (lat - ctx.minLat) * ctx.scale,
  }
}

function pointsToPathD(points: Point[]): string {
  if (points.length === 0) return ''
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
}

function ringToPathD(ring: [number, number][], ctx: ProjectionCtx): string {
  const points = ring.map(([lng, lat]) => project(lng, lat, ctx))
  return pointsToPathD(points) + ' Z'
}

export interface WalkShareGeometry {
  viewSize: number
  routePathD: string
  territoryPathDs: string[]
  centroidPoint: Point | null
}

export function buildShareGeometry(
  route: [number, number][] | null,
  territory: TerritoryPolygon | null,
): WalkShareGeometry {
  const bounds = buildBounds(route, territory)
  if (!bounds) {
    return { viewSize: VIEW_SIZE, routePathD: '', territoryPathDs: [], centroidPoint: null }
  }

  const ctx = makeProjection(bounds)

  const routePathD = route ? pointsToPathD(route.map(([lng, lat]) => project(lng, lat, ctx))) : ''

  let territoryPathDs: string[] = []
  let centroidPoint: Point | null = null

  if (territory) {
    if (territory.type === 'Polygon') {
      territoryPathDs = [
        territory.coordinates
          .filter((ring) => ring.length > 0)
          .map((ring) => ringToPathD(ring as [number, number][], ctx))
          .join(' '),
      ]
    } else {
      for (const polygonCoords of territory.coordinates) {
        territoryPathDs.push(
          polygonCoords
            .filter((ring) => ring.length > 0)
            .map((ring) => ringToPathD(ring as [number, number][], ctx))
            .join(' '),
        )
      }
    }

    const [centLng, centLat] = computeGeometryCentroid(territory)
    centroidPoint = project(centLng, centLat, ctx)
  }

  return { viewSize: VIEW_SIZE, routePathD, territoryPathDs, centroidPoint }
}
