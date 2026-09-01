interface ToastProps {
  message: string
  visible: boolean
}

export default function Toast({ message, visible }: ToastProps) {
  if (!visible) return null
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-20 pointer-events-none">
      <div className="px-4 py-2.5 bg-navy text-cream text-f12 font-medium rounded-pill shadow-lg animate-fade-up whitespace-nowrap">
        {message}
      </div>
    </div>
  )
}
