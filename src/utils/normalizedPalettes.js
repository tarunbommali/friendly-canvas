/**
 * normalizedPalettes.js
 *
 * Harmonized 21-track color system.
 * Design principle: same S/L band (Primary: 55%S/36%L, Accent: 60%S/80%L),
 * only hue rotates — so every track "belongs together" visually while remaining
 * distinctly identifiable as its own signpost.
 *
 * Each entry also exposes a CSS `rgb` triple for use with rgba() in CSS variables.
 */

function hsl(h, s, l) {
  // Convert HSL → hex
  s /= 100
  l /= 100
  const k = (n) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n) =>
    Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))))
  const toHex = (v) => v.toString(16).padStart(2, '0')
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`
}

function hslRgb(h, s, l) {
  s /= 100; l /= 100
  const k = (n) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n) => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))))
  return `${f(0)}, ${f(8)}, ${f(4)}`
}

// Primary: hsl(H, 55%, 36%)  — deep, confident, readable on off-white
// Accent:  hsl(H, 60%, 80%)  — light pastel, works as highlighter
const TRACK_HUES = [
  { track: 'Track 1 — Why Computers Exist',               hue: 30,  palette: 'Amber History'   },
  { track: 'Track 2 — How a Computer Acts…',              hue: 210, palette: 'Steel Blue'       },
  { track: 'Track 3 — How Software Became…',              hue: 165, palette: 'Teal Craft'       },
  { track: 'Track 4 — Operating Systems',                 hue: 270, palette: 'System Purple'    },
  { track: 'Track 5 — Programming',                       hue: 145, palette: 'Code Green'       },
  { track: 'Track 6 — Problem Solving & DSA',             hue: 18,  palette: 'Logic Orange'     },
  { track: 'Track 7 — Software Engineering',              hue: 200, palette: 'Engineering Blue' },
  { track: 'Track 8 — Networking Fundamentals…',          hue: 185, palette: 'Network Cyan'     },
  { track: 'Track 9 — How the Web Works',                 hue: 232, palette: 'Web Cobalt'       },
  { track: 'Track 10 — Databases',                        hue: 250, palette: 'Indigo Data'      },
  { track: 'Track 11 — DevOps & Cloud',                   hue: 193, palette: 'Cloud Sky'        },
  { track: 'Track 12 — Security',                         hue: 355, palette: 'Shield Red'       },
  { track: 'Track 13 — Mobile',                           hue: 280, palette: 'Mobile Violet'    },
  { track: 'Track 14 — AI & Machine Learning',            hue: 155, palette: 'Emerald AI'       },
  { track: 'Track 15 — System Design',                    hue: 48,  palette: 'Gold Architecture'},
  { track: 'Track 16 — Open Source',                      hue: 118, palette: 'Grass Green'      },
  { track: 'Track 17 — Career',                           hue: 315, palette: 'Rose Career'      },
  { track: 'Track 18 — Frontend',                         hue: 228, palette: 'Cornflower UI'    },
  { track: 'Track 19 — Backend',                          hue: 38,  palette: 'Warm Gold API'    },
  { track: 'Track 20 — Testing',                          hue: 162, palette: 'Seafoam QA'       },
  { track: 'Track 21 — From AI Coder to AI Agent',        hue: 258, palette: 'Deep Violet AI'   },
]

/**
 * Build a lookup table keyed by track name fragment.
 * Partial key matching is used since track names in data.json
 * may vary slightly in phrasing.
 */
export const NORMALIZED_PALETTES = TRACK_HUES.reduce((acc, { track, hue, palette }) => {
  acc[track] = {
    primary:    hsl(hue, 55, 36),
    accent:     hsl(hue, 60, 80),
    primaryRgb: hslRgb(hue, 55, 36),
    accentRgb:  hslRgb(hue, 60, 80),
    palette,
    hue,
  }
  return acc
}, {})

/**
 * Get the normalized palette for a track name, using partial key matching.
 * Falls back to the raw palette from data.json if no match is found.
 */
export function getNormalizedPalette(trackName, rawPalette) {
  if (!trackName) return rawPalette

  // Exact match
  if (NORMALIZED_PALETTES[trackName]) return { ...rawPalette, ...NORMALIZED_PALETTES[trackName] }

  // Extract track number and match on that
  const numMatch = trackName.match(/Track (\d+)/i)
  if (numMatch) {
    const trackNo = parseInt(numMatch[1], 10)
    const byIndex = TRACK_HUES[trackNo - 1]
    if (byIndex) {
      const norm = NORMALIZED_PALETTES[byIndex.track]
      return { ...rawPalette, ...norm }
    }
  }

  return rawPalette
}
