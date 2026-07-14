import { useState, useCallback } from 'react'
import { GUIDE_SEEN_KEYS } from '../constants/guideSeenKeys'

const GUIDE_VERSION = '1'
const VERSION_KEY = 'safepaw:guideFlowVersion'

function lsGet(key: string): string | null {
  try { return localStorage.getItem(key) } catch { return null }
}

function lsSet(key: string, value: string): void {
  try { localStorage.setItem(key, value) } catch { /* ignore */ }
}

function lsRemove(key: string): void {
  try { localStorage.removeItem(key) } catch { /* ignore */ }
}

type GuideKey = keyof typeof GUIDE_SEEN_KEYS
;(function initGuideVersion() {
  if (lsGet(VERSION_KEY) !== GUIDE_VERSION) {
    Object.values(GUIDE_SEEN_KEYS).forEach(lsRemove)
    lsSet(VERSION_KEY, GUIDE_VERSION)
  }
})()

export function useGuideFlow(key: GuideKey) {
  const storageKey = GUIDE_SEEN_KEYS[key]

  const [hasSeen, setHasSeen] = useState(() => lsGet(storageKey) === 'true')

  const markSeen = useCallback(() => {
    lsSet(storageKey, 'true')
    setHasSeen(true)
  }, [storageKey])

  return { hasSeen, markSeen }
}
