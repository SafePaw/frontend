import { useMemo, type RefObject } from 'react'
import type { WalkShareData } from '../../../types/walk'
import { buildShareGeometry } from '../../../utils/walkShareGeometry'
import WalkShareMapOverlay from './walkShareMapOverlay'
import WalkShareStats from './walkShareStats'
import shareCardBG from '../../../assets/shareCardBG.jpeg'

interface Props {
  cardRef: RefObject<HTMLDivElement>
  data: WalkShareData
  bgObjectUrl: string | null
  animationTriggered: boolean
  reducedMotion: boolean
  markerClipId?: string
}

export default function WalkShareCard({
  cardRef,
  data,
  bgObjectUrl,
  animationTriggered,
  reducedMotion,
  markerClipId,
}: Props) {
  const geometry = useMemo(
    () => buildShareGeometry(data.route, data.territory?.polygon ?? null),
    [data.route, data.territory],
  )

  return (
    <div
      ref={cardRef}
      className="relative w-full overflow-hidden rounded-xl"
      style={{ aspectRatio: '4 / 5' }}
    >
      {/* Background layer */}
      <div className="absolute inset-0">
        <img
          src={bgObjectUrl ?? shareCardBG}
          alt="산책 공유 배경"
          className="w-full h-full object-cover"
          crossOrigin="anonymous"
        />
        {bgObjectUrl && <div className="absolute inset-0 bg-black/35" aria-hidden="true" />}
      </div>

      {/* 영토 표시 */}
      <div className="absolute inset-0 flex flex-col">
        <div className="relative flex-1 min-h-0">
          <div className="absolute inset-4">
            <WalkShareMapOverlay
              geometry={geometry}
              profileImageUrl={data.markerImageUrl}
              territoryColor={data.territoryColor}
              markerClipId={markerClipId}
              dogName={data.dogName}
              animationTriggered={animationTriggered}
              reducedMotion={reducedMotion}
            />
          </div>
        </div>

        {/* 산책 기록 */}
        <div className={`shrink-0 px-5 pb-6 pt-2 ${bgObjectUrl ? 'text-cream' : 'text-navy'}`}>
          <p className="text-f12 font-medium mb-3">{data.dogName}의 산책</p>
          <WalkShareStats
            data={data}
            animationTriggered={animationTriggered}
            reducedMotion={reducedMotion}
          />
          <p className="text-f8 mt-3 text-right">SafePaw</p>
        </div>
      </div>
    </div>
  )
}
