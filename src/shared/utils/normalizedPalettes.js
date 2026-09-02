/**
 * normalizedPalettes.js
 *
 * Harmonized 21-collection color system.
 * Design principle: same S/L band (Primary: 55%S/36%L, Accent: 60%S/80%L),
 * only hue rotates — so every collection "belongs together" visually while remaining
 * distinctly identifiable as its own signpost.
 *
 * Each entry also exposes a CSS `rgb` triple for use with rgba() in CSS variables.
 */

function hslToRgb(h, s, l) {
  s /= 100
  l /= 100
  const k = (n) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n) =>
    Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))))
  return [f(0), f(8), f(4)]
}

function hsl(h, s, l) {
  const [r, g, b] = hslToRgb(h, s, l)
  const toHex = (v) => v.toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function hslRgb(h, s, l) {
  const [r, g, b] = hslToRgb(h, s, l)
  return `${r}, ${g}, ${b}`
}

// Primary: hsl(H, 55%, 36%)  — deep, confident, readable on off-white
// Accent:  hsl(H, 60%, 80%)  — light pastel, works as highlighter
const COLLECTION_HUES = [
  { collection: 'Collection 1 — Why Computers Exist', hue: 30, palette: 'Amber History' },
  { collection: 'Collection 2 — How a Computer Actually Works', hue: 210, palette: 'Steel Blue' },
  { collection: 'Collection 3 — How Software Became Possible', hue: 165, palette: 'Teal Craft' },
  { collection: 'Collection 4 — Operating Systems', hue: 273, palette: 'System Purple' },
  { collection: 'Collection 5 — Programming', hue: 145, palette: 'Code Green' },
  { collection: 'Collection 6 — Problem Solving & DSA', hue: 18, palette: 'Logic Orange' },
  { collection: 'Collection 7 — Software Engineering', hue: 200, palette: 'Engineering Blue' },
  { collection: 'Collection 8 — Networking Fundamentals', hue: 185, palette: 'Network Cyan' },
  { collection: 'Collection 9 — How the Web Works', hue: 232, palette: 'Web Cobalt' },
  { collection: 'Collection 10 — Web Development', hue: 250, palette: 'Coral Web' },
  { collection: 'Collection 11 — Frameworks & Backend', hue: 193, palette: 'Mint Backend' },
  { collection: 'Collection 12 — Databases', hue: 355, palette: 'Sky Blue Data' },
  { collection: 'Collection 13 — Security', hue: 280, palette: 'Crimson Shield' },
  { collection: 'Collection 14 — Linux + DevOps', hue: 155, palette: 'Charcoal DevOps' },
  { collection: 'Collection 15 — Cloud Computing', hue: 48, palette: 'Cobalt Cloud' },
  { collection: 'Collection 16 — System Design', hue: 118, palette: 'Forest Arch' },
  { collection: 'Collection 17 — Data & Python', hue: 315, palette: 'Yellow-Blue Data' },
  { collection: 'Collection 18 — Machine Learning', hue: 228, palette: 'Rose ML' },
  { collection: 'Collection 19 — Deep Learning', hue: 38, palette: 'Violet DL' },
  { collection: 'Collection 20 — Generative AI', hue: 162, palette: 'Neon GenAI' },
  { collection: 'Collection 21 — AI Agents', hue: 258, palette: 'Deep Violet Agent' },
]

/**
 * Build a lookup table keyed by collection name fragment.
 * Partial key matching is used since collection names in data.json
 * may vary slightly in phrasing.
 */
export const NORMALIZED_PALETTES = COLLECTION_HUES.reduce((acc, { collection, hue, palette }) => {
  acc[collection] = {
    primary: hsl(hue, 55, 36),
    accent: hsl(hue, 60, 80),
    primaryRgb: hslRgb(hue, 55, 36),
    accentRgb: hslRgb(hue, 60, 80),
    palette,
    hue,
  }
  return acc
}, {})

/**
 * Get the normalized palette for a collection name, using partial key matching.
 * Falls back to the raw palette from data.json if no match is found.
 */
export function getNormalizedPalette(collectionName, rawPalette) {
  if (!collectionName) return rawPalette

  // Exact match
  if (NORMALIZED_PALETTES[collectionName]) return { ...rawPalette, ...NORMALIZED_PALETTES[collectionName] }

  // Extract collection number and match on that
  const numMatch = collectionName.match(/collection (\d+)/i)
  if (numMatch) {
    const collectionNo = parseInt(numMatch[1], 10)
    const byIndex = COLLECTION_HUES[collectionNo - 1]
    if (byIndex) {
      const norm = NORMALIZED_PALETTES[byIndex.collection]
      return { ...rawPalette, ...norm }
    }
  }

  return rawPalette
}
