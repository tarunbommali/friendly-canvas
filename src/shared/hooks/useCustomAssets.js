/**
 * useCustomAssets.js
 * ──────────────────
 * Global hook for user-uploaded and URL-linked image assets.
 * Backed by IndexedDB (assetDb) to prevent localStorage quota exhaustion.
 */

import { useState, useEffect, useCallback } from 'react'
import { assetDb } from '../../infrastructure/persistence/indexedDbRepository'

function uid() {
  return `custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

export function useCustomAssets() {
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)

  // Initial load from IndexedDB
  useEffect(() => {
    let isMounted = true
    async function loadIndexedDbAssets() {
      try {
        const stored = await assetDb.getAllAssets()
        if (isMounted) {
          // Normalize to component schema: { id, label, url, type, createdAt }
          const normalized = stored.map((item) => ({
            id: item.id,
            label: item.name || item.label || 'Custom Asset',
            url: item.dataUrl || item.url || '',
            type: item.type || 'upload',
            createdAt: item.createdAt || Date.now(),
          }))
          setAssets(normalized)
        }
      } catch (err) {
        console.warn('[useCustomAssets] Failed to load assets from IndexedDB:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadIndexedDbAssets()
    return () => {
      isMounted = false
    }
  }, [])

  /** Add an uploaded file — converts to data URL and persists into IndexedDB */
  const addUpload = useCallback((file, label) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const entry = {
          id: uid(),
          label: label || file.name.replace(/\.[^.]+$/, ''),
          url: e.target.result,
          type: 'upload',
          mimeType: file.type,
          createdAt: Date.now(),
        }

        try {
          await assetDb.saveAsset({
            id: entry.id,
            name: entry.label,
            mimeType: entry.mimeType,
            dataUrl: entry.url,
            sizeBytes: file.size,
            tags: ['upload'],
          })
          setAssets((prev) => [entry, ...prev])
          resolve(entry)
        } catch (dbErr) {
          console.error('[useCustomAssets] Failed to persist into IndexedDB:', dbErr)
          // Fallback state update
          setAssets((prev) => [entry, ...prev])
          resolve(entry)
        }
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }, [])

  /** Add an external image URL and persist reference in IndexedDB */
  const addUrl = useCallback(async (url, label) => {
    const entry = {
      id: uid(),
      label: label || 'Linked Image',
      url,
      type: 'url',
      createdAt: Date.now(),
    }

    try {
      await assetDb.saveAsset({
        id: entry.id,
        name: entry.label,
        mimeType: 'image/external',
        dataUrl: entry.url,
        sizeBytes: 0,
        tags: ['url'],
      })
    } catch (err) {
      console.warn('[useCustomAssets] Failed to persist URL into IndexedDB:', err)
    }

    setAssets((prev) => [entry, ...prev])
    return entry
  }, [])

  /** Remove an asset by ID from state and IndexedDB */
  const removeAsset = useCallback(async (id) => {
    try {
      await assetDb.deleteAsset(id)
    } catch (err) {
      console.warn('[useCustomAssets] Failed to delete asset from IndexedDB:', err)
    }
    setAssets((prev) => prev.filter((a) => a.id !== id))
  }, [])

  return {
    assets,
    loading,
    addUpload,
    addUrl,
    removeAsset,
  }
}

export default useCustomAssets
