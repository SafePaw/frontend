import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { motion, useReducedMotion } from 'framer-motion'

interface Props {
  title: string
  onClose: () => void
  children: ReactNode
}

export default function BottomSheet({ title, onClose, children }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const dialog = dialogRef.current
    const previousFocus = document.activeElement
    const bodyOverflow = document.body.style.overflow
    const root = document.getElementById('root')
    const rootOverflow = root?.style.overflow
    dialog?.showModal()
    document.body.style.overflow = 'hidden'
    if (root) root.style.overflow = 'hidden'
    return () => {
      dialog?.close()
      document.body.style.overflow = bodyOverflow
      if (root) root.style.overflow = rootOverflow ?? ''
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected)
        previousFocus.focus({ preventScroll: true })
    }
  }, [])

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className="fixed inset-0 m-0 h-full max-h-none w-full max-w-none border-0 bg-black/40 p-0 text-navy open:flex items-end justify-center backdrop:bg-transparent"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onKeyDown={(event) => {
        if (event.key !== 'Tab') return
        const controls = event.currentTarget.querySelectorAll<HTMLElement>(
          'button:not(:disabled), a[href], input:not(:disabled), [tabindex="0"]',
        )
        const first = controls[0]
        const last = controls[controls.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first?.focus()
        }
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <motion.div
        className="w-full max-w-[430px] max-h-[85dvh] overflow-y-auto overscroll-contain rounded-t-xl bg-white px-6 pt-4"
        style={{ paddingBottom: 'calc(16px + env(safe-area-inset-bottom))' }}
        initial={reducedMotion ? false : { y: '100%' }}
        animate={{ y: 0 }}
        transition={{ duration: 0.24, ease: [0.32, 0.72, 0, 1] }}
      >
        <div aria-hidden="true" className="mx-auto mb-6 h-1 w-10 rounded-full bg-navy-15" />
        <h2 id={titleId} className="mb-4 text-f20 font-semibold">
          {title}
        </h2>
        {children}
        <button
          type="button"
          className="mt-4 min-h-12 w-full rounded-lg bg-navy-5 text-f16 text-navy-70"
          onClick={onClose}
        >
          취소
        </button>
      </motion.div>
    </dialog>,
    document.body,
  )
}
