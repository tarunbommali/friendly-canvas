/**
 * migrationService.js
 * ───────────────────
 * Automatic schema & persistence migration pipeline.
 * Migrates legacy localStorage stores (including base64 custom assets) to IndexedDB
 * and upgrades custom posts to the canonical v1.0.0 format.
 */

import { assetDb } from './indexedDbRepository'
import { customPostsRepo } from './localStorageRepository'
import { createCanonicalPost } from '../../domain/post/postModel'

const MIGRATION_FLAG_KEY = 'swe_notebook_migrated_v1'

export async function runPersistenceMigrations() {
  if (typeof window === 'undefined') return

  try {
    const alreadyMigrated = window.localStorage.getItem(MIGRATION_FLAG_KEY)
    if (alreadyMigrated) return

    console.info('[MigrationService] Checking for legacy data migrations...')

    // 1. Migrate legacy base64 custom assets from localStorage -> IndexedDB
    const legacyAssetsRaw = window.localStorage.getItem('swe-notebook-custom-assets')
    if (legacyAssetsRaw) {
      try {
        const legacyAssets = JSON.parse(legacyAssetsRaw)
        if (Array.isArray(legacyAssets) && legacyAssets.length > 0) {
          console.info(`[MigrationService] Migrating ${legacyAssets.length} custom assets to IndexedDB...`)
          for (const asset of legacyAssets) {
            await assetDb.saveAsset({
              id: asset.id || `custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              name: asset.name || asset.label || 'Imported Asset',
              type: asset.type || 'image/png',
              dataUrl: asset.dataUrl || asset.url || '',
              category: 'custom',
              createdAt: asset.createdAt || new Date().toISOString(),
            })
          }
          // Remove bulky base64 data from localStorage once migrated
          window.localStorage.removeItem('swe-notebook-custom-assets')
          console.info('[MigrationService] Legacy custom assets successfully moved to IndexedDB.')
        }
      } catch (err) {
        console.warn('[MigrationService] Failed to migrate custom assets:', err)
      }
    }

    // 2. Migrate and normalize legacy custom posts
    const existingPosts = customPostsRepo.get()
    if (Array.isArray(existingPosts) && existingPosts.length > 0) {
      let modified = false
      const upgradedPosts = existingPosts.map(post => {
        if (!post.schemaVersion || post.schemaVersion !== '1.0.0') {
          modified = true
          return createCanonicalPost({
            id: post.id,
            title: post.title || post.name,
            trackId: post.trackNo || '01',
            trackName: post.trackName || 'Custom Track',
            palette: post.trackColor || { primary: '#1E5FA8', accent: '#A9D0F5' },
            slides: post.slides || [],
            metadata: {
              createdAt: post.createdAt,
              updatedAt: post.updatedAt,
            },
          })
        }
        return post
      })

      if (modified) {
        customPostsRepo.set(upgradedPosts)
        console.info('[MigrationService] Upgraded custom posts to canonical schema v1.0.0.')
      }
    }

    window.localStorage.setItem(MIGRATION_FLAG_KEY, 'true')
  } catch (err) {
    console.error('[MigrationService] Migration process encountered an error:', err)
  }
}
