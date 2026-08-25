import { useState, useCallback } from 'react'

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
