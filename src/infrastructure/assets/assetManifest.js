/**
 * assetManifest.js
 * ────────────────
 * Dynamic asset manifest indexer & search resolver.
 * Treats swe.notebook.assets/manifest.json as the single source of truth (ASSET-001)
 * and builds a normalized keyword/tag search index at runtime.
 */

export const SWE_ASSETS_BASE = '/swe-assets'

let manifestCache = null
let searchIndexCache = null

/**
 * Loads the raw manifest.json dynamically
 */
export async function loadAssetManifest() {
  if (manifestCache) return manifestCache

  try {
    // Try fetching from public/assets path or dynamic import
    const response = await fetch('/manifest.json').catch(() => null)
    if (response && response.ok) {
      manifestCache = await response.json()
      return manifestCache
    }
  } catch (err) {
    console.warn('[AssetManifest] Could not fetch /manifest.json directly, falling back to static resolver:', err)
  }

  return manifestCache || {}
}

/**
 * Builds normalized search index from manifest structure
 */
export function buildAssetSearchIndex(manifest) {
  if (searchIndexCache) return searchIndexCache

  const index = []
  if (!manifest || typeof manifest !== 'object') return index

  // Process tracks and categories
  if (Array.isArray(manifest.tracks)) {
    manifest.tracks.forEach(track => {
      const trackDir = track.dir || `track_${String(track.num).padStart(2, '0')}`
      if (Array.isArray(track.assets)) {
        track.assets.forEach(asset => {
          index.push({
            id: `asset_${track.num}_${asset.file}`,
            category: track.title,
            file: asset.file,
            label: asset.label || asset.file.replace(/[-_.]/g, ' '),
            url: `${SWE_ASSETS_BASE}/${trackDir}/${asset.file}`,
            source: 'taxonomy',
            tags: [
              ...(asset.tags || []),
              track.title.toLowerCase(),
              asset.file.toLowerCase(),
            ],
          })
        })
      }
    })
  }

  // Process top-level categories if present
  if (Array.isArray(manifest.categories)) {
    manifest.categories.forEach(cat => {
      const catDir = cat.dir || cat.id
      if (Array.isArray(cat.files)) {
        cat.files.forEach(fileObj => {
          const fileName = typeof fileObj === 'string' ? fileObj : fileObj.file
          const label = typeof fileObj === 'object' && fileObj.label ? fileObj.label : fileName.replace(/[-_.]/g, ' ')
          index.push({
            id: `asset_${catDir}_${fileName}`,
            category: cat.name || catDir,
            file: fileName,
            label,
            url: `${SWE_ASSETS_BASE}/${catDir}/${fileName}`,
            source: 'taxonomy',
            tags: [
              ...(typeof fileObj === 'object' && fileObj.tags ? fileObj.tags : []),
              (cat.name || '').toLowerCase(),
              fileName.toLowerCase(),
            ],
          })
        })
      }
    })
  }

  searchIndexCache = index
  return index
}

/**
 * Queries assets matching a keyword or category
 */
export function queryAssets(query = '', category = 'all', assetList = []) {
  const q = query.trim().toLowerCase()
  return assetList.filter(item => {
    const matchesCategory = category === 'all' || item.category === category || (item.cat && item.cat === category)
    if (!matchesCategory) return false
    if (!q) return true

    const matchesLabel = item.label && item.label.toLowerCase().includes(q)
    const matchesFile = item.file && item.file.toLowerCase().includes(q)
    const matchesTags = Array.isArray(item.tags) && item.tags.some(t => t.toLowerCase().includes(q))

    return matchesLabel || matchesFile || matchesTags
  })
}
