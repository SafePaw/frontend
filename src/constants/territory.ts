export const TERRITORY_MAP_IDS = {
  source: 'territory-all-source',
  fillLayer: 'territory-fill',
  outlineLayer: 'territory-outline',
} as const

export const HOME_TERRITORY_MAP_IDS = {
  source: 'home-territory-source',
  fillLayer: 'home-territory-fill',
  outlineLayer: 'home-territory-outline',
} as const

export const CREW_TERRITORY_MAP_IDS = {
  source: 'crew-territory-source',
  fillLayer: 'crew-territory-fill',
  outlineLayer: 'crew-territory-outline',
} as const

export const TERRITORY_MAP_CONFIG = {
  defaultCenter: [127.0, 37.5] as [number, number],
  defaultZoom: 15,
  fitBoundsPadding: 60,
  maxZoomOnFit: 15,
  fillOpacityMine: 0.35,
  fillOpacityOther: 0.15,
  fillOpacitySelected: 0.6,
  lineWidthDefault: 1.5,
  lineWidthSelected: 3,
} as const
