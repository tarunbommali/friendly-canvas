/**
 * indexedDbRepository.js
 * ──────────────────────
 * IndexedDB persistence engine for binary image assets and custom media uploads.
 * Resolves STATE-003 by decoupling large image blobs from synchronous localStorage.
 */

const DB_NAME = 'swe_notebook_assets_db'
const DB_VERSION = 1
const ASSETS_STORE = 'custom_assets'

class IndexedDbRepository {
  constructor() {
    this.db = null
    this.initPromise = null
  }

  async getDb() {
    if (this.db) return this.db
    if (this.initPromise) return this.initPromise

    this.initPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return reject(new Error('IndexedDB is not available in this environment.'))
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION)

      request.onupgradeneeded = event => {
        const db = event.target.result
        if (!db.objectStoreNames.contains(ASSETS_STORE)) {
          const store = db.createObjectStore(ASSETS_STORE, { keyPath: 'id' })
          store.createIndex('createdAt', 'createdAt', { unique: false })
          store.createIndex('category', 'category', { unique: false })
        }
      }

      request.onsuccess = event => {
        this.db = event.target.result
        resolve(this.db)
      }

      request.onerror = event => {
        console.error('[IndexedDbRepository] Failed to open DB:', event.target.error)
        reject(event.target.error)
      }
    })

    return this.initPromise
  }

  /**
   * Saves or updates an asset in IndexedDB
   * @param {Object} asset - { id, name, type, dataUrl, blob, category, createdAt }
   */
  async saveAsset(asset) {
    try {
      const db = await this.getDb()
      return new Promise((resolve, reject) => {
        const tx = db.transaction(ASSETS_STORE, 'readwrite')
        const store = tx.objectStore(ASSETS_STORE)

        const record = {
          id: asset.id || `asset_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
          name: asset.name || 'Unnamed Asset',
          type: asset.type || 'image/png',
          dataUrl: asset.dataUrl || '',
          category: asset.category || 'custom',
          createdAt: asset.createdAt || new Date().toISOString(),
          metadata: asset.metadata || {},
        }

        const req = store.put(record)
        req.onsuccess = () => resolve(record)
        req.onerror = () => reject(req.error)
      })
    } catch (err) {
      console.error('[IndexedDbRepository] saveAsset failed:', err)
      throw err
    }
  }

  /**
   * Retrieves asset by ID
   */
  async getAsset(id) {
    try {
      const db = await this.getDb()
      return new Promise((resolve, reject) => {
        const tx = db.transaction(ASSETS_STORE, 'readonly')
        const store = tx.objectStore(ASSETS_STORE)
        const req = store.get(id)
        req.onsuccess = () => resolve(req.result || null)
        req.onerror = () => reject(req.error)
      })
    } catch (err) {
      console.error(`[IndexedDbRepository] getAsset(${id}) failed:`, err)
      return null
    }
  }

  /**
   * Retrieves all stored custom assets
   */
  async getAllAssets() {
    try {
      const db = await this.getDb()
      return new Promise((resolve, reject) => {
        const tx = db.transaction(ASSETS_STORE, 'readonly')
        const store = tx.objectStore(ASSETS_STORE)
        const req = store.getAll()
        req.onsuccess = () => resolve(req.result || [])
        req.onerror = () => reject(req.error)
      })
    } catch (err) {
      console.error('[IndexedDbRepository] getAllAssets failed:', err)
      return []
    }
  }

  /**
   * Deletes an asset by ID
   */
  async deleteAsset(id) {
    try {
      const db = await this.getDb()
      return new Promise((resolve, reject) => {
        const tx = db.transaction(ASSETS_STORE, 'readwrite')
        const store = tx.objectStore(ASSETS_STORE)
        const req = store.delete(id)
        req.onsuccess = () => resolve(true)
        req.onerror = () => reject(req.error)
      })
    } catch (err) {
      console.error(`[IndexedDbRepository] deleteAsset(${id}) failed:`, err)
      return false
    }
  }

  /**
   * Clears all custom assets
   */
  async clearAll() {
    try {
      const db = await this.getDb()
      return new Promise((resolve, reject) => {
        const tx = db.transaction(ASSETS_STORE, 'readwrite')
        const store = tx.objectStore(ASSETS_STORE)
        const req = store.clear()
        req.onsuccess = () => resolve(true)
        req.onerror = () => reject(req.error)
      })
    } catch (err) {
      console.error('[IndexedDbRepository] clearAll failed:', err)
      return false
    }
  }
}

export const assetDb = new IndexedDbRepository()
