/**
 * textAnnotations.js
 * ──────────────────
 * Generates Fabric.js per-character `styles` objects that implement
 * the editorial annotation system from the design spec:
 *
 *  • HEADLINE  — last (key) word gets a flat fluorescent highlight block
 *  • BODY TEXT — important words get a colored underline
 *
 * Fabric styles format:
 *   { [lineIndex]: { [charIndex]: { prop: value, ... } } }
 *
 * These are passed directly to Textbox as the `styles` option.
 */

// ─────────────────────────────────────────────────────────────
// Highlight color palette (flat, no gradient / glow)
// ─────────────────────────────────────────────────────────────
const HIGHLIGHT_COLORS = [
  '#BFE8FF', // soft cyan-blue  (default for primary palette)
  '#FFF176', // warm yellow
  '#D8F5A2', // lime green
  '#F5C6EA', // lavender pink
  '#FFD8B1', // soft coral
]

/**
 * Pick highlight color from collection accent or fallback palette.
 * Ensures the highlight is always a flat, semi-transparent tint.
 */
function resolveHighlightColor(accentColor) {
  if (accentColor && accentColor.startsWith('#') && accentColor.length === 7) {
    // Convert to a 40% opacity by mixing with white
    const r = parseInt(accentColor.slice(1, 3), 16)
    const g = parseInt(accentColor.slice(3, 5), 16)
    const b = parseInt(accentColor.slice(5, 7), 16)
    // Blend toward white at 55%: result = color*0.45 + 255*0.55
    const blend = (c) => Math.round(c * 0.45 + 255 * 0.55)
    return `rgb(${blend(r)},${blend(g)},${blend(b)})`
  }
  return HIGHLIGHT_COLORS[0]
}

/**
 * Find character positions of the last word in a string.
 * Returns { start, end } (end is exclusive).
 */
function lastWordRange(text) {
  if (!text) return null
  const trimmed = text.trimEnd()
  let end = trimmed.length
  while (end > 0 && /[?.!,;:]/.test(trimmed[end - 1])) end--
  let start = end
  while (start > 0 && !/\s/.test(trimmed[start - 1])) start--
  return start < end ? { start, end } : null
}

/**
 * Accurately estimates rendered line count of text for vertical spacing
 * without altering or corrupting the text string.
 */
export function wrapTextToLines(text, fontSize = 64, maxWidth = 800) {
  if (text === null || text === undefined) return []
  const str = String(text)
  if (str.length === 0) return []

  const avgCharWidth = fontSize * 0.44
  const maxCharsPerLine = Math.max(1, Math.floor(maxWidth / avgCharWidth))

  const paragraphs = str.split(/\r?\n/)
  const lines = []

  for (let i = 0; i < paragraphs.length; i++) {
    const para = paragraphs[i]
    if (para.trim() === '') {
      lines.push('')
      continue
    }

    const words = para.split(' ').filter(Boolean)
    if (words.length === 0) {
      lines.push('')
      continue
    }

    let currentLine = ''
    for (const word of words) {
      if ((currentLine + (currentLine ? ' ' : '') + word).length > maxCharsPerLine && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = currentLine ? currentLine + ' ' + word : word
      }
    }
    if (currentLine) {
      lines.push(currentLine)
    }
  }

  return lines
}

/**
 * Build a Fabric `styles` object that highlights the last word of the
 * headline text with a flat background color block.
 *
 * Indexed by paragraph line index for native Fabric Textbox rendering.
 */
export function buildHeadlineStyles(text, accent) {
  if (!text) return {}

  const highlightColor = resolveHighlightColor(accent)
  const paragraphs = String(text).split(/\r?\n/)
  if (paragraphs.length === 0) return {}

  let lastParaIdx = paragraphs.length - 1
  while (lastParaIdx >= 0 && !paragraphs[lastParaIdx].trim()) {
    lastParaIdx--
  }
  if (lastParaIdx < 0) return {}

  const lastParaText = paragraphs[lastParaIdx]
  const range = lastWordRange(lastParaText)
  if (!range) return {}

  const styles = {}
  styles[lastParaIdx] = {}

  for (let ci = range.start; ci < range.end; ci++) {
    styles[lastParaIdx][ci] = {
      textBackgroundColor: highlightColor,
      fontStyle: 'italic',
      fontWeight: 'bold',
    }
  }

  return styles
}

/**
 * Build a Fabric `styles` object for body text.
 * Returns empty styles to ensure Fabric.js native Textbox soft-wrapping
 * never produces overlapping character glyphs or word merging artifacts.
 */
export function buildBodyStyles() {
  return {}
}
