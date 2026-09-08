import { useEffect, useMemo, useRef } from 'react'
import pawIconSrc from '../../../assets/paw.png'
import { DEFAULT_TERRITORY_COLOR_HEX } from '../../../constants/territoryColors'
import type { WalkShareGeometry } from '../../../utils/walkShareGeometry'

const MARKER_R = 16
const MARKER_PIN_H = 8

function crayonPath(path: string): string {
  let seed = 37
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 4294967296
  }
  return Array.from({ length: 5 }, (_, pass) => {
    let previous: [number, number] | null = null
    const offset = (pass - 2) * 1.1
    return path.replace(/([ML])(-?[\d.]+),(-?[\d.]+)|Z/g, (match, command, x, y) => {
      if (match === 'Z') {
        previous = null
        return 'Z'
      }
      const point: [number, number] = [Number(x), Number(y)]
      const start = previous
      previous = point
      const jitter = (value: number) => (value + offset + (random() - 0.5) * 2.1).toFixed(2)
      if (!start || command === 'M') return `M${jitter(point[0])},${jitter(point[1])}`
      const steps = Math.max(
        1,
        Math.min(64, Math.ceil(Math.hypot(point[0] - start[0], point[1] - start[1]) / 3)),
      )
      return Array.from({ length: steps }, (_, i) => {
        const t = (i + 1) / steps
        return `L${jitter(start[0] + (point[0] - start[0]) * t)},${jitter(start[1] + (point[1] - start[1]) * t)}`
      }).join(' ')
    })
  }).join(' ')
}

interface Props {
  geometry: WalkShareGeometry
  profileImageUrl: string | null
  dogName: string
  animationTriggered: boolean
  reducedMotion: boolean
  territoryColor: string | null
  markerClipId?: string
}

export default function WalkShareMapOverlay({
  geometry,
  profileImageUrl,
  dogName,
  animationTriggered,
  reducedMotion,
  territoryColor,
  markerClipId = 'walk-share-marker-clip',
}: Props) {
  const { viewSize, routePathD, territoryPathDs, centroidPoint } = geometry
  const crayonRoute = useMemo(() => crayonPath(routePathD), [routePathD])
  const crayonTerritories = useMemo(() => territoryPathDs.map(crayonPath), [territoryPathDs])
  const routePathRef = useRef<SVGPathElement>(null)
  const routeAnimatedRef = useRef(false)

  useEffect(() => {
    if (!animationTriggered || routeAnimatedRef.current) return
    const el = routePathRef.current
    if (!el || !routePathD) return

    routeAnimatedRef.current = true

    if (reducedMotion) {
      el.style.strokeDasharray = ''
      el.style.strokeDashoffset = '0'
      return
    }

    const len = el.getTotalLength()
    el.style.strokeDasharray = `${len}`
    el.style.strokeDashoffset = `${len}`
    el.getBoundingClientRect()
    el.style.transition = 'stroke-dashoffset 1.4s ease-in-out'
    el.style.strokeDashoffset = '0'
  }, [animationTriggered, routePathD, reducedMotion])

  function territoryStyle(): React.CSSProperties {
    if (!animationTriggered) return { opacity: 0 }
    if (reducedMotion) return { opacity: 1 }
    return { animation: 'fade-scale-in 0.8s cubic-bezier(0.34,1.56,0.64,1) 1.2s both' }
  }

  function markerStyle(): React.CSSProperties {
    if (!animationTriggered) return { opacity: 0 }
    if (reducedMotion) return { opacity: 1 }
    return { animation: 'paw-pop 0.45s cubic-bezier(0.34,1.56,0.64,1) 2.0s both' }
  }

  const markerImageSrc = profileImageUrl ?? pawIconSrc
  const territoryFill = territoryColor ?? DEFAULT_TERRITORY_COLOR_HEX
  const crayonFilterId = `${markerClipId}-crayon`

  return (
    <svg
      viewBox={`0 0 ${viewSize} ${viewSize}`}
      className="w-full h-full"
      aria-label="산책 경로 지도"
    >
      <defs>
        <pattern
          id={`${crayonFilterId}-grain`}
          width={32}
          height={32}
          patternUnits="userSpaceOnUse"
        >
          <rect width={32} height={32} fill="white" />
          {Array.from({ length: 150 }, (_, i) => (
            <ellipse
              key={i}
              cx={((((Math.sin(i * 127.1 + 3) * 43758.5453) % 1) + 1) % 1) * 32}
              cy={((((Math.sin(i * 311.7 + 11) * 23421.631) % 1) + 1) % 1) * 32}
              rx={0.35 + (i % 4) * 0.3}
              ry={0.2 + (i % 3) * 0.23}
              fill={i % 3 === 0 ? '#777' : '#111'}
            />
          ))}
        </pattern>
        <mask
          id={crayonFilterId}
          maskUnits="userSpaceOnUse"
          x={0}
          y={0}
          width={viewSize}
          height={viewSize}
        >
          <rect width={viewSize} height={viewSize} fill={`url(#${crayonFilterId}-grain)`} />
        </mask>
        {centroidPoint && (
          <clipPath id={markerClipId}>
            <circle
              cx={centroidPoint.x}
              cy={centroidPoint.y - MARKER_R - MARKER_PIN_H}
              r={MARKER_R - 3}
            />
          </clipPath>
        )}
      </defs>

      {/* 획득 영토 표시 */}
      {territoryPathDs.length > 0 && (
        <g style={territoryStyle()}>
          {territoryPathDs.map((d, i) => (
            <g key={i}>
              <path d={d} fill={territoryFill} fillRule="evenodd" fillOpacity={0.25} />
              <path
                d={crayonTerritories[i]}
                fill="none"
                stroke={territoryFill}
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
                mask={`url(#${crayonFilterId})`}
              />
            </g>
          ))}
        </g>
      )}

      {/* 이동 경로 */}
      {routePathD && (
        <path
          ref={routePathRef}
          d={crayonRoute}
          fill="none"
          stroke="white"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          mask={`url(#${crayonFilterId})`}
          style={{ strokeDashoffset: routePathD ? undefined : '0' }}
        />
      )}

      {centroidPoint && (
        <g style={markerStyle()}>
          {/* Pin tail */}
          <path
            d={`M${centroidPoint.x},${centroidPoint.y} L${centroidPoint.x - 6},${centroidPoint.y - MARKER_PIN_H} L${centroidPoint.x + 6},${centroidPoint.y - MARKER_PIN_H} Z`}
            fill="#F2E6B1"
          />
          {/* 기본 배경 */}
          <circle
            cx={centroidPoint.x}
            cy={centroidPoint.y - MARKER_R - MARKER_PIN_H}
            r={MARKER_R}
            fill="#F2E6B1"
            stroke="#2A3244"
            strokeWidth={2}
            filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
          />
          {/* 프로필 */}
          <image
            href={markerImageSrc}
            x={centroidPoint.x - (MARKER_R - 3)}
            y={centroidPoint.y - MARKER_R * 2 - MARKER_PIN_H + 3}
            width={(MARKER_R - 3) * 2}
            height={(MARKER_R - 3) * 2}
            clipPath={`url(#${markerClipId})`}
            preserveAspectRatio="xMidYMid slice"
            aria-label={`${dogName} 프로필`}
          />
        </g>
      )}
    </svg>
  )
}
