export const ROUTES = {
  SPLASH: '/',
  LOGIN: '/login',
  OAUTH_CALLBACK: '/auth/callback/:provider',
  OAUTH_CALLBACK_FOR: (provider: string) => `/auth/callback/${provider}`,

  ONBOARDING: {
    LOCATION: '/onboarding/location',
    DOG: '/onboarding/dog',
    COLOR: '/onboarding/color',
    TUTORIAL: '/onboarding/tutorial',
  },

  HOME: '/home',

  WALK: {
    READY: '/walk/ready',
    ACTIVE: '/walk/active',
    CONFIRM_END: '/walk/confirm-end',
    RESULT: '/walk/result',
    ERROR: {
      LOCATION: '/walk/error/location',
      GPS: '/walk/error/gps',
      SAVE_FAIL: '/walk/error/save-fail',
    },
  },

  MY: {
    INDEX: '/my',
    HISTORY: '/my/history',
    DETAIL: (walkId: string) => `/my/history/${walkId}`,
    SETTINGS: '/my/settings',
  },

  DOGS: {
    INDEX: '/dogs',
    REGISTRATION: '/dogs/registration',
    DETAIL: '/dogs/:dogId',
    DETAIL_OF: (dogId: number | string) => `/dogs/${dogId}`,
  },

  PROFILE: '/profile',
} as const
