/**
 * localStorageRepository.js
 * ─────────────────────────
 * Centralized, typed repository for LocalStorage interactions.
 * Provides quota safety, schema metadata wrapping, corruption fallback, and event dispatch.
 */

const STORAGE_PREFIX = 'swe_notebook_'
const REPO_VERSION = '1.0.0'

export class LocalStorageRepository {
  constructor(key, defaultValue = null) {
    this.storageKey = key.startsWith('swe') ? key : `${STORAGE_PREFIX}${key}`
    this.defaultValue = defaultValue
  }

  /**
   * Retrieves data wrapped in metadata with fallback
   */
  get() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return this.defaultValue
      }
      const raw = window.localStorage.getItem(this.storageKey)
      if (!raw) return this.defaultValue

      const parsed = JSON.parse(raw)
      // If object has schema metadata wrapper
      if (parsed && typeof parsed === 'object' && '__swe_version' in parsed) {
        return parsed.data
      }
      return parsed
    } catch (err) {
      console.warn(`[LocalStorageRepository] Failed to read key "${this.storageKey}":`, err)
      return this.defaultValue
    }
  }

  /**
   * Alias for get()
   */
  getAll() {
    return this.get()
  }

  /**
   * Writes data wrapped in versioned envelope
   */
  set(data) {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false

      const envelope = {
        __swe_version: REPO_VERSION,
        updatedAt: new Date().toISOString(),
        data,
      }
      window.localStorage.setItem(this.storageKey, JSON.stringify(envelope))
      return true
    } catch (err) {
      if (err.name === 'QuotaExceededError' || err.code === 22) {
        console.error(`[LocalStorageRepository] Quota exceeded for "${this.storageKey}". Consider purging old records or using IndexedDB.`, err)
      } else {
        console.error(`[LocalStorageRepository] Error writing "${this.storageKey}":`, err)
      }
      return false
    }
  }

  /**
   * Removes key
   */
  remove() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(this.storageKey)
      }
    } catch (err) {
      console.warn(`[LocalStorageRepository] Error removing "${this.storageKey}":`, err)
    }
  }

  /**
   * Clears all swe-notebook keys
   */
  static clearAll() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return
      const keysToRemove = []
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i)
        if (key && (key.startsWith('swe-') || key.startsWith(STORAGE_PREFIX))) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(k => window.localStorage.removeItem(k))
    } catch (err) {
      console.error('[LocalStorageRepository] Failed to clear items:', err)
    }
  }
}

// Canonical Repository Singletons
export const customPostsRepo = new LocalStorageRepository('swe-custom-carousel-posts', [])
export const layoutCollectionsRepo = new LocalStorageRepository('swe-layout-collections', [])
export const slideOverridesRepo = new LocalStorageRepository('swe-notebook-slide-overrides', {})
export const slideAssetsRepo = new LocalStorageRepository('swe-notebook-slide-assets', {})
export const collectionColorsRepo = new LocalStorageRepository('swe-notebook-collection-colors', {})
