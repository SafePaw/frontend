import { useEffect, useState } from 'react'
import { registerMessagingSw } from '../firebase/firebaseApp'
import {
  requestNotificationPermission,
  getFcmToken,
  type FcmStatus,
} from '../firebase/firebaseMessaging'
import { registerDeviceToken, deleteDeviceToken } from '../api/deviceTokens'

export function useNotificationSettings() {
  const [fcmStatus, setFcmStatus] = useState<FcmStatus>(() => {
    if (!('Notification' in window)) return 'unsupported'
    const perm = Notification.permission
    if (perm === 'denied') return 'denied'
    if (perm === 'granted') return 'granted'
    return 'default'
  })

  useEffect(() => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return

    async function syncToken() {
      const swReg = await registerMessagingSw()
      if (!swReg) return
      const token = await getFcmToken(swReg)
      if (!token) return
      try {
        const res = await registerDeviceToken(token)
        if (res.success) setFcmStatus('token-ready')
      } catch {
        //
      }
    }

    syncToken()
  }, [])

  async function enableNotifications() {
    const swReg = await registerMessagingSw()
    if (!swReg) {
      setFcmStatus('unsupported')
      return
    }

    const permission = await requestNotificationPermission()
    if (permission === 'denied') {
      setFcmStatus('denied')
      return
    }
    if (permission !== 'granted') return

    setFcmStatus('granted')
    const token = await getFcmToken(swReg)
    if (!token) {
      setFcmStatus('error')
      return
    }

    try {
      const res = await registerDeviceToken(token)
      if (res.success) {
        if (import.meta.env.DEV) console.log('[FCM] Device token registered')
        setFcmStatus('token-ready')
      } else {
        setFcmStatus('error')
      }
    } catch {
      setFcmStatus('error')
    }
  }

  async function unregisterNotificationToken() {
    if (!('Notification' in window) || Notification.permission !== 'granted') return
    try {
      const swReg = await registerMessagingSw()
      if (!swReg) return
      const token = await getFcmToken(swReg)
      if (token) await deleteDeviceToken(token)
    } catch {
      //
    }
  }

  return { fcmStatus, enableNotifications, unregisterNotificationToken }
}
