import { getApp, getApps, initializeApp } from 'firebase/app'
import type { FirebaseApp } from 'firebase/app'

const REQUIRED_KEYS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const

function createFirebaseApp(): FirebaseApp | null {
  const missing = REQUIRED_KEYS.filter((k) => !import.meta.env[k])
  if (missing.length > 0) return null

  if (getApps().length) return getApp()

  return initializeApp({
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  })
}

export const firebaseApp: FirebaseApp | null = createFirebaseApp()

function buildSwUrl(): string {
  const params = new URLSearchParams({
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '',
  })
  return `/firebase-messaging-sw.js?${params.toString()}`
}

let _swReg: ServiceWorkerRegistration | null = null
let _swPromise: Promise<ServiceWorkerRegistration | null> | null = null

export async function registerMessagingSw(): Promise<ServiceWorkerRegistration | null> {
  if (_swReg) return _swReg
  if (_swPromise) return _swPromise
  if (!('serviceWorker' in navigator) || !firebaseApp) return null

  _swPromise = navigator.serviceWorker
    .register(buildSwUrl())
    .then((reg) => {
      _swReg = reg
      return reg
    })
    .catch(() => null)
    .finally(() => {
      _swPromise = null
    }) as Promise<ServiceWorkerRegistration | null>

  return _swPromise
}
