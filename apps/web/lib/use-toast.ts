'use client'
import * as React from 'react'

type ToastVariant = 'default' | 'destructive'

interface Toast {
  id: string
  title?: string
  description?: string
  variant?: ToastVariant
}

let toastCount = 0

type Listener = (toasts: Toast[]) => void
const listeners: Listener[] = []
let memoryToasts: Toast[] = []

function dispatch(action: { type: 'ADD'; toast: Toast } | { type: 'REMOVE'; id: string }) {
  if (action.type === 'ADD') {
    memoryToasts = [action.toast, ...memoryToasts].slice(0, 3)
  } else {
    memoryToasts = memoryToasts.filter((t) => t.id !== action.id)
  }
  listeners.forEach((l) => l(memoryToasts))
}

export function toast(opts: Omit<Toast, 'id'>) {
  const id = String(++toastCount)
  dispatch({ type: 'ADD', toast: { ...opts, id } })
  setTimeout(() => dispatch({ type: 'REMOVE', id }), 4000)
}

export function useToast() {
  const [toasts, setToasts] = React.useState<Toast[]>(memoryToasts)
  React.useEffect(() => {
    listeners.push(setToasts)
    return () => {
      const idx = listeners.indexOf(setToasts)
      if (idx > -1) listeners.splice(idx, 1)
    }
  }, [])
  return { toasts }
}
