import { getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging'
import type { Messaging, MessagePayload } from 'firebase/messaging'
import { firebaseApp } from './firebaseApp'

export type FcmStatus =
  | 'unsupported'
  | 'default'
  | 'denied'
  | 'granted'
  | 'token-ready'
  | 'error'

let _messaging: Messaging | null = null

async function getFirebaseMessaging(): Promise<Messaging | null> {
  if (!firebaseApp) return null
  if (_messaging) return _messaging

  const supported = await isSupported()
  if (!supported) return null

  _messaging = getMessaging(firebaseApp)
  return _messaging
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied'
  if (Notification.permission !== 'default') return Notification.permission
  return Notification.requestPermission()
}

export async function getFcmToken(
  swRegistration: ServiceWorkerRegistration,
): Promise<string | null> {
  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY
  if (!vapidKey) return null

  const messaging = await getFirebaseMessaging()
  if (!messaging) return null

  try {
    const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: swRegistration })
    return token || null
  } catch {
    return null
  }
}

export async function listenToForegroundMessages(
  handler: (payload: MessagePayload) => void,
): Promise<(() => void) | null> {
  const messaging = await getFirebaseMessaging()
  if (!messaging) return null
  return onMessage(messaging, handler)
}
