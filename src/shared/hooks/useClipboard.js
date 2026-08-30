import { useState, useCallback, useEffect, useRef } from 'react'

/**
 * useClipboard — Dedicated hook for clipboard and download operations.
 */
export function useClipboard() {
  const [status, setStatus] = useState({ type: null, message: '', title: '' })
  const [isLoading, setIsLoading] = useState(false)

  const copyText = useCallback(async (text, title = 'Copied to Clipboard!', successMsg = '') => {
    try {
      await navigator.clipboard.writeText(text)
      setStatus({ type: 'success', title, message: successMsg })
      setTimeout(() => setStatus({ type: null, message: '', title: '' }), 2500)
      return true
    } catch {
      // Fallback using textarea
      try {
        const textarea = document.createElement('textarea')
        textarea.value = text
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
        setStatus({ type: 'success', title, message: successMsg })
        setTimeout(() => setStatus({ type: null, message: '', title: '' }), 2500)
        return true
      } catch {
        setStatus({ type: 'error', title: 'Copy Failed', message: 'Unable to access clipboard.' })
        setTimeout(() => setStatus({ type: null, message: '', title: '' }), 3000)
        return false
      }
    }
  }, [])

  const copyImage = useCallback(async (blobOrUrl, title = 'Image Copied!', successMsg = '') => {
    setIsLoading(true)
    try {
      let blob = blobOrUrl
      if (typeof blobOrUrl === 'string') {
        const response = await fetch(blobOrUrl)
        blob = await response.blob()
      }

      if (navigator.clipboard && window.ClipboardItem) {
        const item = new ClipboardItem({ [blob.type || 'image/png']: blob })
        await navigator.clipboard.write([item])
        setStatus({ type: 'success', title, message: successMsg || 'Image ready to paste (Ctrl+V).' })
        setTimeout(() => setStatus({ type: null, message: '', title: '' }), 2500)
        return true
      }
      throw new Error('ClipboardItem not supported')
    } catch {
      setStatus({ type: 'error', title: 'Copy Failed', message: 'Unable to write image to clipboard.' })
      setTimeout(() => setStatus({ type: null, message: '', title: '' }), 3000)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  const resetStatus = useCallback(() => setStatus({ type: null, message: '', title: '' }), [])

  return { copyText, copyImage, isLoading, status, resetStatus }
}

/**
 * Listen for browser paste events (images + plain text) while not typing in an input.
 * Used by the carousel editor to drop assets onto the canvas.
 */
export function useEditorPaste(onPayload) {
  const onPayloadRef = useRef(onPayload)

  useEffect(() => {
    onPayloadRef.current = onPayload
  }, [onPayload])

  useEffect(() => {
    const handlePaste = (e) => {
      const activeEl = document.activeElement
      const isInput =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.isContentEditable)
      if (isInput) return

      const items = Array.from(e.clipboardData?.items || [])
      const imageItem = items.find((item) => item.type.startsWith('image/'))
      const emit = onPayloadRef.current
      if (typeof emit !== 'function') return

      if (imageItem) {
        e.preventDefault()
        const file = imageItem.getAsFile()
        if (!file) return
        const reader = new FileReader()
        reader.onload = () => {
          emit({ imageDataUrl: reader.result, text: null })
        }
        reader.readAsDataURL(file)
        return
      }

      const text = e.clipboardData?.getData('text/plain') || ''
      e.preventDefault()
      emit({ imageDataUrl: null, text: text || null })
    }

    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [])
}
