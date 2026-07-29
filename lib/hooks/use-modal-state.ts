import { useState } from 'react'

/**
 * Hook to manage modal state with common patterns
 */
export function useModalState(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen)

  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)
  const toggle = () => setIsOpen(prev => !prev)

  return {
    isOpen,
    open,
    close,
    toggle,
  }
}

/**
 * Hook to manage a modal with associated data (e.g., for delete confirmations)
 */
export function useModalWithData<T>(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen)
  const [data, setData] = useState<T | null>(null)

  const open = (itemData: T) => {
    setData(itemData)
    setIsOpen(true)
  }

  const close = () => {
    setData(null)
    setIsOpen(false)
  }

  return {
    isOpen,
    data,
    open,
    close,
  }
}

