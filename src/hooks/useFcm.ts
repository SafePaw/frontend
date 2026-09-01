import { useEffect, useRef, useState } from 'react'
import { registerMessagingSw } from '../firebase/firebaseApp'
import { listenToForegroundMessages } from '../firebase/firebaseMessaging'

export interface FcmNotice {
  title?: string
  body?: string
}

export function useFcm() {
  const [fcmNotice, setFcmNotice] = useState<FcmNotice | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    registerMessagingSw()
  }, [])

  useEffect(() => {
    let unsubscribe: (() => void) | null = null

    listenToForegroundMessages((payload) => {
      const title = payload.notification?.title
      const body = payload.notification?.body
      if (!title && !body) return

      if (timerRef.current) clearTimeout(timerRef.current)
      setFcmNotice({ title, body })
      timerRef.current = setTimeout(() => setFcmNotice(null), 4000)
    }).then((unsub) => {
      unsubscribe = unsub
    })

    return () => {
      unsubscribe?.()
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return { fcmNotice }
}
