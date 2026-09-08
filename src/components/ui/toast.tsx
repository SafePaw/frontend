interface ToastProps {
  message: string
  visible: boolean
  role?: 'status' | 'alert'
}

export default function Toast({ message, visible, role = 'status' }: ToastProps) {
  if (!visible) return null
  return (
    <div
      role={role}
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-20 pointer-events-none"
    >
      <div className="mx-4 max-w-sm px-4 py-2.5 bg-navy text-cream text-f12 font-medium rounded-pill shadow-lg animate-fade-up whitespace-normal break-words text-center">
        {message}
      </div>
    </div>
  )
}
