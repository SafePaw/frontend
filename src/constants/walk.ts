export const WALK_GPS_CONFIG = {
  initialAccuracyThresholdMeters: 50,
  initialFixTimeoutMs: 15_000,
  pointBatchSize: 60,
  pointUploadIntervalMs: 10_000,
  livePollingIntervalMs: 5_000,
  maxPendingPointCount: 300,
  livePollingFailThreshold: 3,
} as const

export const WALK_MAP_IDS = {
  routeSource: 'walk-route',
  routeLayer: 'walk-route-line',
  startPointSource: 'walk-start',
  startPointLayer: 'walk-start-circle',
  territorySource: 'walk-territory',
  territoryFillLayer: 'walk-territory-fill',
  territoryOutlineLayer: 'walk-territory-outline',
} as const

export const MAPBOX_STYLE_URL = 'mapbox://styles/mapbox/streets-v12'
