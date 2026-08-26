/**
 * useSlideAssets.js
 * ─────────────────
 * Persists assigned assets per track/post/slide using LocalStorageRepository.
 */

import { useState, useCallback } from 'react'
import { slideAssetsRepo } from '../../../infrastructure/persistence/localStorageRepository'

export function useSlideAssets(trackName, postNo, slideNo) {
  const [store, setStore] = useState(() => slideAssetsRepo.get() || {})

  const assigned = store?.[trackName]?.[postNo]?.[slideNo] || []

  const assign = useCallback((asset) => {
    setStore((prev) => {
      const next = { ...prev }
      if (!next[trackName]) next[trackName] = {}
      if (!next[trackName][postNo]) next[trackName][postNo] = {}
      const current = next[trackName][postNo][slideNo] || []
      // Avoid duplicates
      if (current.some((a) => a.url === asset.url)) return prev
      next[trackName][postNo][slideNo] = [
        ...current,
        { cat: asset.cat, file: asset.file, label: asset.label, url: asset.url, isVector: asset.isVector },
      ]
      slideAssetsRepo.set(next)
      return next
    })
  }, [trackName, postNo, slideNo])

  const unassign = useCallback((url) => {
    setStore((prev) => {
      const next = { ...prev }
      if (!next?.[trackName]?.[postNo]?.[slideNo]) return prev
      next[trackName][postNo][slideNo] = next[trackName][postNo][slideNo].filter((a) => a.url !== url)
      slideAssetsRepo.set(next)
      return next
    })
  }, [trackName, postNo, slideNo])

  /** Export the full store as a formatted JSON string */
  const exportJson = useCallback(() => {
    return JSON.stringify(store, null, 2)
  }, [store])

  /** Export JSON for the current slide only */
  const exportSlideJson = useCallback(() => {
    return JSON.stringify(assigned, null, 2)
  }, [assigned])

  /** Clear all assignments for a specific slide */
  const clearSlide = useCallback(() => {
    setStore((prev) => {
      const next = { ...prev }
      if (next?.[trackName]?.[postNo]?.[slideNo]) {
        delete next[trackName][postNo][slideNo]
        slideAssetsRepo.set(next)
      }
      return next
    })
  }, [trackName, postNo, slideNo])

  return {
    assigned,
    assign,
    unassign,
    exportJson,
    exportSlideJson,
    clearSlide,
    allAssets: store,
  }
}
