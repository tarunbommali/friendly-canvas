/**
 * useSlideAssets.js
 * ─────────────────
 * Persists assigned assets per collection/post/slide using LocalStorageRepository.
 */

import { useState, useCallback } from 'react'
import { slideAssetsRepo } from '../../../infrastructure/persistence/localStorageRepository'

export function useSlideAssets(collectionName, postNo, slideNo) {
  const [store, setStore] = useState(() => slideAssetsRepo.get() || {})

  const assigned = store?.[collectionName]?.[postNo]?.[slideNo] || []

  const assign = useCallback((asset) => {
    setStore((prev) => {
      const next = { ...prev }
      if (!next[collectionName]) next[collectionName] = {}
      if (!next[collectionName][postNo]) next[collectionName][postNo] = {}
      const current = next[collectionName][postNo][slideNo] || []
      // Avoid duplicates
      if (current.some((a) => a.url === asset.url)) return prev
      next[collectionName][postNo][slideNo] = [
        ...current,
        { cat: asset.cat, file: asset.file, label: asset.label, url: asset.url, isVector: asset.isVector },
      ]
      slideAssetsRepo.set(next)
      return next
    })
  }, [collectionName, postNo, slideNo])

  const unassign = useCallback((url) => {
    setStore((prev) => {
      const next = { ...prev }
      if (!next?.[collectionName]?.[postNo]?.[slideNo]) return prev
      next[collectionName][postNo][slideNo] = next[collectionName][postNo][slideNo].filter((a) => a.url !== url)
      slideAssetsRepo.set(next)
      return next
    })
  }, [collectionName, postNo, slideNo])

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
      if (next?.[collectionName]?.[postNo]?.[slideNo]) {
        delete next[collectionName][postNo][slideNo]
        slideAssetsRepo.set(next)
      }
      return next
    })
  }, [collectionName, postNo, slideNo])

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
