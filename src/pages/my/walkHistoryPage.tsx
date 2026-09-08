import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { getMyWalks } from '../../api/walks'
import { getDogs } from '../../api/dogs'
import { formatDistance, formatDuration } from '../../utils/rankingFormat'
import { resolveMarkerImage, DEFAULT_MARKER_IMAGE_SRC } from '../../utils/markerImage'
import Button from '../../components/ui/button'
import BottomNav from '../../components/layout/bottomNav'
import type { WalkHistoryItem } from '../../types/walk'
import pawImg from '../../assets/paw.png'

type FilterTab = 'week' | 'month' | 'year' | 'all'

interface BarEntry {
  label: string
  valueM: number
  isCurrent: boolean
}

function getPeriodRange(filter: FilterTab, anchor: Date): { start: Date; end: Date } {
  if (filter === 'week') {
    const day = anchor.getDay()
    const mon = new Date(anchor)
    mon.setDate(anchor.getDate() - (day === 0 ? 6 : day - 1))
    mon.setHours(0, 0, 0, 0)
    const end = new Date(mon)
    end.setDate(mon.getDate() + 7)
    return { start: mon, end }
  }
  if (filter === 'month') {
    const start = new Date(anchor.getFullYear(), anchor.getMonth(), 1)
    const end = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1)
    return { start, end }
  }
  if (filter === 'year') {
    const start = new Date(anchor.getFullYear(), 0, 1)
    const end = new Date(anchor.getFullYear() + 1, 0, 1)
    return { start, end }
  }
  return { start: new Date(0), end: new Date(9999, 0) }
}

function navigatePeriod(filter: FilterTab, anchor: Date, dir: -1 | 1): Date {
  const d = new Date(anchor)
  if (filter === 'week') d.setDate(d.getDate() + dir * 7)
  else if (filter === 'month') d.setMonth(d.getMonth() + dir)
  else if (filter === 'year') d.setFullYear(d.getFullYear() + dir)
  return d
}

function getPeriodLabel(filter: FilterTab, anchor: Date): string {
  if (filter === 'all') return '전체 기록'
  if (filter === 'year') return `${anchor.getFullYear()}년`
  if (filter === 'month') return `${anchor.getFullYear()}년 ${anchor.getMonth() + 1}월`
  const { start, end } = getPeriodRange('week', anchor)
  const last = new Date(end)
  last.setDate(end.getDate() - 1)
  return `${start.getMonth() + 1}/${start.getDate()} – ${last.getMonth() + 1}/${last.getDate()}`
}

function isCurrentOrFuturePeriod(filter: FilterTab, anchor: Date): boolean {
  const { end } = getPeriodRange(filter, anchor)
  return end > new Date()
}

const WEEK_LABELS = ['월', '화', '수', '목', '금', '토', '일']

function buildBarData(walks: WalkHistoryItem[], filter: FilterTab, anchor: Date): BarEntry[] {
  const today = new Date()

  if (filter === 'week') {
    const { start } = getPeriodRange('week', anchor)
    const { start: curStart } = getPeriodRange('week', today)
    const isCurWeek = start.getTime() === curStart.getTime()
    const todayIdx = today.getDay() === 0 ? 6 : today.getDay() - 1
    return WEEK_LABELS.map((label, i) => {
      const s = new Date(start)
      s.setDate(start.getDate() + i)
      const e = new Date(s)
      e.setDate(s.getDate() + 1)
      const total = walks
        .filter((w) => {
          const d = new Date(w.startedAt)
          return d >= s && d < e
        })
        .reduce((acc, w) => acc + w.stats.distanceMeters, 0)
      return { label, valueM: total, isCurrent: isCurWeek && i === todayIdx }
    })
  }

  if (filter === 'month') {
    const yr = anchor.getFullYear(),
      mo = anchor.getMonth()
    const days = new Date(yr, mo + 1, 0).getDate()
    const isCurMo = yr === today.getFullYear() && mo === today.getMonth()
    return Array.from({ length: days }, (_, i) => {
      const s = new Date(yr, mo, i + 1)
      const e = new Date(yr, mo, i + 2)
      const total = walks
        .filter((w) => {
          const d = new Date(w.startedAt)
          return d >= s && d < e
        })
        .reduce((acc, w) => acc + w.stats.distanceMeters, 0)
      return {
        label: String(i + 1),
        valueM: total,
        isCurrent: isCurMo && i + 1 === today.getDate(),
      }
    })
  }

  if (filter === 'year') {
    const yr = anchor.getFullYear()
    const isCurYr = yr === today.getFullYear()
    return Array.from({ length: 12 }, (_, i) => {
      const s = new Date(yr, i, 1),
        e = new Date(yr, i + 1, 1)
      const total = walks
        .filter((w) => {
          const d = new Date(w.startedAt)
          return d >= s && d < e
        })
        .reduce((acc, w) => acc + w.stats.distanceMeters, 0)
      return { label: String(i + 1), valueM: total, isCurrent: isCurYr && i === today.getMonth() }
    })
  }

  return Array.from({ length: 12 }, (_, i) => {
    const offset = 11 - i
    const s = new Date(today.getFullYear(), today.getMonth() - offset, 1)
    const e = new Date(today.getFullYear(), today.getMonth() - offset + 1, 1)
    const total = walks
      .filter((w) => {
        const d = new Date(w.startedAt)
        return d >= s && d < e
      })
      .reduce((acc, w) => acc + w.stats.distanceMeters, 0)
    return { label: String(s.getMonth() + 1), valueM: total, isCurrent: offset === 0 }
  })
}

const DAYS_KO = ['일', '월', '화', '수', '목', '금', '토']

function formatCardDate(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const day = DAYS_KO[d.getDay()]
  const mo = d.getMonth() + 1
  const dt = d.getDate()
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const time = `${hh}:${mm}`
  return d.getFullYear() === now.getFullYear()
    ? `${mo}월 ${dt}일 (${day}) ${time}`
    : `${d.getFullYear()}년 ${mo}월 ${dt}일 (${day}) ${time}`
}

function formatTotalTime(sec: number): string {
  if (sec === 0) return '0:00'
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// ─── 바 차트 ────────────────────────────────────────────────────────────────

function showLabel(i: number, n: number, filter: FilterTab): boolean {
  if (filter === 'week' || filter === 'year') return true
  if (filter === 'all') return i % 2 === 0
  return i === 0 || i === 9 || i === 19 || i === n - 1
}

function BarChart({ bars, filter }: { bars: BarEntry[]; filter: FilterTab }) {
  const maxVal = Math.max(...bars.map((b) => b.valueM), 1)
  const n = bars.length
  const gap = filter === 'month' ? 'gap-px' : filter === 'year' ? 'gap-1' : 'gap-1.5'

  return (
    <div className={`flex items-end w-full ${gap}`} style={{ height: '80px' }}>
      {bars.map((b, i) => {
        const pct = b.valueM > 0 ? Math.max((b.valueM / maxVal) * 56, 4) : 0
        const hasLabel = showLabel(i, n, filter)
        return (
          <div key={i} className="flex flex-col items-center flex-1 min-w-0">
            {/* bar */}
            <div className="flex items-end justify-center w-full" style={{ height: '60px' }}>
              <div
                className="w-full"
                style={{
                  height: pct === 0 ? '2px' : `${pct}px`,
                  backgroundColor: pct === 0 ? '#E5E8EF' : b.isCurrent ? '#2A3244' : '#BCC5D1',
                  borderRadius: filter === 'month' ? '1px 1px 0 0' : '3px 3px 0 0',
                  transition: 'height 0.3s ease',
                }}
              />
            </div>
            <div style={{ height: '20px' }} className="flex items-start justify-center w-full pt-1">
              {hasLabel && (
                <span className="text-navy-70 leading-none" style={{ fontSize: '8px' }}>
                  {b.label}
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ActivityCard({
  item,
  markerSrc,
  onClick,
  onShare,
}: {
  item: WalkHistoryItem
  markerSrc: string
  onClick: () => void
  onShare: () => void
}) {
  const isTerritory = item.walkType === 'TERRITORY'
  const [imgError, setImgError] = useState(false)
  return (
    <div className="flex items-center gap-2 border-b border-navy-8">
      <button
        type="button"
        onClick={onClick}
        aria-label={`${formatCardDate(item.startedAt)} ${item.dogName} 산책 상세 보기`}
        className="flex flex-1 min-w-0 items-center gap-3 py-4 text-left active:opacity-60 transition-opacity"
      >
        <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center bg-navy-8">
          <img
            src={imgError ? DEFAULT_MARKER_IMAGE_SRC : markerSrc}
            alt=""
            className="w-8 h-8 object-contain"
            onError={() => setImgError(true)}
          />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-f12 text-navy-70 mb-0.5">{formatCardDate(item.startedAt)}</p>
          <p className="text-f14 font-semibold text-navy mb-1 truncate">
            {item.dogName}
            {isTerritory && (
              <span className="text-f12 font-normal text-navy-70 ml-1">· 영토 획득</span>
            )}
          </p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-f13 font-medium text-navy tabular-nums">
              {formatDistance(item.stats.distanceMeters)}
            </span>
            <span className="text-navy-15">·</span>
            <span className="text-f13 text-navy-70 tabular-nums">
              {formatDuration(item.stats.durationSeconds)}
            </span>
            <span className="text-navy-15">·</span>
            <span className="text-f13 text-navy-70 tabular-nums">
              {item.stats.averageSpeedKmh.toFixed(1)} km/h
            </span>
          </div>
        </div>

        <span className="text-navy-70 text-f16 flex-shrink-0">›</span>
      </button>
      {item.status === 'COMPLETED' && (
        <Button
          type="button"
          variant="ghost"
          className="min-w-11 min-h-11 shrink-0 !p-3"
          aria-label={`${formatCardDate(item.startedAt)} ${item.dogName} 공유 카드 보기`}
          onClick={onShare}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 16V3m-4 4 4-4 4 4M5 13v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7" />
          </svg>
        </Button>
      )}
    </div>
  )
}

export default function WalkHistoryPage() {
  const navigate = useNavigate()
  const [allWalks, setAllWalks] = useState<WalkHistoryItem[]>([])
  const [dogMarkerMap, setDogMarkerMap] = useState<Record<number, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterTab>('month')
  const [anchor, setAnchor] = useState(new Date())

  useEffect(() => {
    let cancelled = false
    async function fetchAllWalks(): Promise<WalkHistoryItem[]> {
      const acc: WalkHistoryItem[] = []
      let page = 0
      while (page < 10) {
        const data = await getMyWalks({ page, size: 20 })
        acc.push(...data.content)
        if (!data.hasNext) break
        page++
      }
      return acc
    }
    async function loadAll() {
      setIsLoading(true)
      try {
        const [dogs, walks] = await Promise.all([getDogs(), fetchAllWalks()])
        const map: Record<number, string> = {}
        for (const dog of dogs) {
          map[dog.id] = resolveMarkerImage({
            markerImageType: dog.markerImageType,
            markerImageValue: dog.markerImageValue,
            markerImageUrl: dog.markerImageUrl,
          })
        }
        if (!cancelled) {
          setAllWalks(walks)
          setDogMarkerMap(map)
        }
      } catch {
        if (!cancelled) setError('산책 기록을 불러오지 못했어요.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    loadAll()
    return () => {
      cancelled = true
    }
  }, [])

  const periodWalks = useMemo(() => {
    if (filter === 'all') return allWalks
    const { start, end } = getPeriodRange(filter, anchor)
    return allWalks.filter((w) => {
      const d = new Date(w.startedAt)
      return d >= start && d < end
    })
  }, [allWalks, filter, anchor])

  const totalDistanceM = useMemo(
    () => periodWalks.reduce((s, w) => s + w.stats.distanceMeters, 0),
    [periodWalks],
  )
  const totalDurationSec = useMemo(
    () => periodWalks.reduce((s, w) => s + w.stats.durationSeconds, 0),
    [periodWalks],
  )
  const walkCount = periodWalks.length
  const avgSpeedKmh = totalDurationSec > 0 ? totalDistanceM / 1000 / (totalDurationSec / 3600) : 0

  const bars = useMemo(() => buildBarData(allWalks, filter, anchor), [allWalks, filter, anchor])
  const canGoNext = !isCurrentOrFuturePeriod(filter, anchor)

  function handleFilter(f: FilterTab) {
    setFilter(f)
    setAnchor(new Date())
  }

  if (isLoading) {
    return (
      <div className="flex h-full bg-cream items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-navy-15 border-t-navy animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col h-full bg-cream">
        <div className="flex items-center px-6 pt-14 pb-4">
          <button onClick={() => navigate(-1)} className="mr-3 text-f20 text-navy-70 leading-none">
            ←
          </button>
          <h1 className="text-f20 font-semibold text-navy">활동</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
          <p className="text-f16 text-navy-70 text-center">{error}</p>
          <Button variant="ghost" onClick={() => window.location.reload()}>
            다시 시도
          </Button>
        </div>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-cream">
      {/* Header */}
      <div className="flex items-center px-6 pt-14 pb-3 flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="mr-3 text-f20 text-navy-70 leading-none"
          aria-label="뒤로가기"
        >
          ←
        </button>
        <h1 className="text-f20 font-semibold text-navy">활동</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {/* Filter tabs */}
        <div className="px-6 mb-5">
          <div className="flex bg-navy-8 rounded-full p-1 gap-0.5">
            {(['week', 'month', 'year', 'all'] as FilterTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => handleFilter(tab)}
                className={[
                  'flex-1 py-1.5 text-f13 font-medium rounded-full transition-colors duration-150',
                  filter === tab ? 'bg-navy text-cream' : 'text-navy-70',
                ].join(' ')}
              >
                {tab === 'week' ? '주' : tab === 'month' ? '월' : tab === 'year' ? '년' : '전체'}
              </button>
            ))}
          </div>
        </div>

        {filter !== 'all' && (
          <div className="px-6 flex items-center justify-between mb-4">
            <span className="text-f16 font-semibold text-navy">
              {getPeriodLabel(filter, anchor)}
            </span>
            <div className="flex items-center">
              <button
                onClick={() => setAnchor((prev) => navigatePeriod(filter, prev, -1))}
                className="w-9 h-9 flex items-center justify-center text-navy-70 active:opacity-50"
                aria-label="이전"
              >
                <span className="text-f20 leading-none">‹</span>
              </button>
              <button
                onClick={() => setAnchor((prev) => navigatePeriod(filter, prev, 1))}
                disabled={!canGoNext}
                className="w-9 h-9 flex items-center justify-center text-navy-70 active:opacity-50 disabled:opacity-25"
                aria-label="다음"
              >
                <span className="text-f20 leading-none">›</span>
              </button>
            </div>
          </div>
        )}

        <div className="px-6 mb-1">
          <p
            className="font-black text-navy leading-none"
            style={{ fontSize: '3.25rem', letterSpacing: '-0.02em' }}
          >
            {totalDistanceM > 0 ? (totalDistanceM / 1000).toFixed(1) : '0.0'}
          </p>
          <p className="text-f13 text-navy-70 mt-1">킬로미터</p>
        </div>

        {walkCount > 0 && (
          <div className="px-6 flex items-start gap-6 mb-6 mt-3">
            <SubStat label="산책" value={`${walkCount}회`} />
            <SubStat label="평균 속도" value={`${avgSpeedKmh.toFixed(1)} km/h`} />
            <SubStat label="시간" value={formatTotalTime(totalDurationSec)} />
          </div>
        )}
        <div className="px-6 mb-8">
          <BarChart bars={bars} filter={filter} />
        </div>
        <div className="px-6">
          <p className="text-f16 font-semibold text-navy mb-1">최근 활동</p>

          {periodWalks.length === 0 ? (
            <div className="flex flex-col items-center py-12 gap-3">
              <img src={pawImg} alt="" className="w-10 h-10" />
              <p className="text-f14 text-navy-70 text-center">이 기간의 산책 기록이 없어요</p>
              <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.WALK.READY)}>
                산책 시작하기
              </Button>
            </div>
          ) : (
            <div>
              {periodWalks.map((item) => (
                <ActivityCard
                  key={item.walkId}
                  item={item}
                  markerSrc={dogMarkerMap[item.dogId] ?? DEFAULT_MARKER_IMAGE_SRC}
                  onShare={() => navigate(ROUTES.WALK.SHARE_OF(item.walkId))}
                  onClick={() =>
                    navigate(ROUTES.MY.DETAIL(String(item.walkId)), {
                      state: { dogName: item.dogName, walkType: item.walkType },
                    })
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

function SubStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-f16 font-semibold text-navy tabular-nums leading-tight">{value}</p>
      <p className="text-f12 text-navy-70 mt-0.5">{label}</p>
    </div>
  )
}
