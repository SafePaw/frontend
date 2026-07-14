import { DOG_MARKER_PRESETS, DEFAULT_PRESET_ID } from '../constants/dogMarkers'
import type { MarkerImageType } from '../types/dog'

const FRONTEND_PRESET_IMAGE_MAP: Record<string, string> = Object.fromEntries(
  DOG_MARKER_PRESETS.map((preset) => [preset.id, preset.imageSrc]),
)

export const BACKEND_PRESET_TO_FRONTEND_PRESET: Record<string, string> = {
  'preset-01': 'akita-inu',
  'preset-02': 'bichon',
  'preset-03': 'boston-terrier',
  'preset-04': 'bulldog',
  'preset-05': 'corgi',
  'preset-06': 'dachshund',
  'preset-07': 'doodle',
  'preset-08': 'greyhound',
  'preset-09': 'jack-russel-terrier',
  'preset-10': 'maltese',
  'preset-11': 'mix',
  'preset-12': 'pomeranian',
  'preset-13': 'poodle',
  'preset-14': 'shih-tzu',
  'preset-15': 'terrier',
}

export const FRONTEND_PRESET_TO_BACKEND_PRESET: Record<string, string> = Object.fromEntries(
  Object.entries(BACKEND_PRESET_TO_FRONTEND_PRESET).map(([backendValue, frontendId]) => [
    frontendId,
    backendValue,
  ]),
)

export const DEFAULT_MARKER_IMAGE_SRC =
  FRONTEND_PRESET_IMAGE_MAP[DEFAULT_PRESET_ID] ?? DOG_MARKER_PRESETS[0]?.imageSrc ?? ''

export function toFrontendPresetId(markerImageValue?: string | null): string | null {
  if (!markerImageValue) return null
  return BACKEND_PRESET_TO_FRONTEND_PRESET[markerImageValue] ?? markerImageValue
}

export function toBackendPresetValue(frontendPresetId?: string | null): string | null {
  if (!frontendPresetId) return null
  return FRONTEND_PRESET_TO_BACKEND_PRESET[frontendPresetId] ?? frontendPresetId
}

export function resolveMarkerImage(params: {
  markerImageType?: MarkerImageType | null
  markerImageValue?: string | null
  markerImageUrl?: string | null
}): string {
  const { markerImageType, markerImageValue, markerImageUrl } = params

  if (markerImageType === 'PRESET') {
    const frontendPresetId = toFrontendPresetId(markerImageValue)
    if (frontendPresetId && FRONTEND_PRESET_IMAGE_MAP[frontendPresetId]) {
      return FRONTEND_PRESET_IMAGE_MAP[frontendPresetId]
    }
    if (markerImageUrl) return markerImageUrl
    return DEFAULT_MARKER_IMAGE_SRC
  }

  if (markerImageType === 'UPLOADED') {
    return markerImageUrl ?? DEFAULT_MARKER_IMAGE_SRC
  }

  return markerImageUrl ?? DEFAULT_MARKER_IMAGE_SRC
}

export function isPresetMarkerSelected(params: {
  dogMarkerImageType?: MarkerImageType | null
  dogMarkerImageValue?: string | null
  frontendPresetId: string
}): boolean {
  if (params.dogMarkerImageType !== 'PRESET') return false
  return toFrontendPresetId(params.dogMarkerImageValue) === params.frontendPresetId
}
