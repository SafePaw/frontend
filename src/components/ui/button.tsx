import { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'fill' | 'light' | 'ghost' | 'text' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  children: ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  fill: 'bg-navy text-cream',
  light: 'bg-cream text-navy border border-navy-15',
  ghost: 'bg-navy-8 text-navy',
  text: 'bg-transparent text-navy-70 underline underline-offset-2',
  danger: 'bg-err text-white',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-f12',
  md: 'px-5 py-3 text-f16',
  lg: 'px-7 py-4 text-f16',
}

export default function Button({
  variant = 'fill',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        'inline-flex items-center justify-center gap-1.5',
        'font-medium rounded-pill leading-none',
        'transition-opacity duration-150 active:scale-[0.97]',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}
