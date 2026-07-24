import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'

const baseControl =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm transition-colors placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 disabled:cursor-not-allowed disabled:bg-slate-100'

interface LabelWrapProps {
  label?: string
  required?: boolean
  error?: string
  hint?: string
  children: ReactNode
  className?: string
}

export function FieldWrap({
  label,
  required,
  error,
  hint,
  children,
  className = '',
}: LabelWrapProps) {
  return (
    <div className={className}>
      {label && (
        <label className="mb-1 block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export function Input({ label, error, hint, required, className = '', ...rest }: InputProps) {
  return (
    <FieldWrap label={label} required={required} error={error} hint={hint}>
      <input className={`${baseControl} ${className}`} {...rest} />
    </FieldWrap>
  )
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  children: ReactNode
}

export function Select({ label, error, required, className = '', children, ...rest }: SelectProps) {
  return (
    <FieldWrap label={label} required={required} error={error}>
      <select className={`${baseControl} ${className}`} {...rest}>
        {children}
      </select>
    </FieldWrap>
  )
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function Textarea({ label, error, required, className = '', ...rest }: TextareaProps) {
  return (
    <FieldWrap label={label} required={required} error={error}>
      <textarea className={`${baseControl} resize-none ${className}`} {...rest} />
    </FieldWrap>
  )
}
