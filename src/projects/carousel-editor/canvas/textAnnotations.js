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

const UNDERLINE_COLORS = {
  default: '#1E5FA8', // blue — logic / technical concept
  warning: '#DC2626', // red  — problem / warning
  solution: '#16A34A', // green — outcome / solution
  action: '#C05621',  // orange — tool / transition
}

/**
 * Pick highlight color from track accent or fallback palette.
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
  const trimmed = text.trimEnd()
  // Walk backward to find the last word boundary
  let end = trimmed.length
  // Skip trailing punctuation
  while (end > 0 && /[?.!,;:]/.test(trimmed[end - 1])) end--
  let start = end
  while (start > 0 && !/\s/.test(trimmed[start - 1])) start--
  return start < end ? { start, end } : null
}

/**
 * Build a Fabric `styles` object that highlights the last word of the
 * headline text with a flat background color block.
 *
 * @param {string} text       - The headline text
 * @param {string} accent     - Track accent color (hex)
 * @returns {object}          - Fabric styles object
 */
export function buildHeadlineStyles(text, accent) {
  if (!text) return {}

  const highlightColor = resolveHighlightColor(accent)
  const range = lastWordRange(text)
  if (!range) return {}

  // Fabric styles are per-line. We need to map character indices to lines
  // based on actual newlines in the text (not wrapping, which is runtime).
  // For soft-wrap safety, we apply to a whole-string char index and let
  // Fabric distribute across lines automatically using flat index approach.
  // Fabric styles: { lineIndex: { charIndex: style } }
  // We convert flat char range → line-based positions.
  const lines = text.split('\n')
  const styles = {}
  let flatIdx = 0

  lines.forEach((line, lineIdx) => {
    for (let ci = 0; ci < line.length; ci++) {
      if (flatIdx >= range.start && flatIdx < range.end) {
        if (!styles[lineIdx]) styles[lineIdx] = {}
        styles[lineIdx][ci] = {
          textBackgroundColor: highlightColor,
          fontStyle: 'italic',
          fontWeight: 'bold',
        }
      }
      flatIdx++
    }
    flatIdx++ // for the \n character between lines
  })

  return styles
}

// ─────────────────────────────────────────────────────────────
// Important word detection heuristics for body text
// These words will get underlined automatically.
// ─────────────────────────────────────────────────────────────
const SKIP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'for', 'nor', 'so', 'yet',
  'at', 'by', 'in', 'of', 'on', 'to', 'up', 'as', 'is', 'it',
  'be', 'do', 'go', 'we', 'he', 'she', 'they', 'you', 'i',
  'was', 'are', 'were', 'has', 'had', 'have', 'with', 'from',
  'that', 'this', 'its', 'our', 'not', 'just', 'into',
])

/**
 * Detect important words in body text by:
 * - Selecting words that are long (≥ 6 chars) and not in the skip list
 * - Limiting to 2 underlined words max (first two qualifying words)
 *
 * Returns array of { start, end } flat char ranges.
 */
function detectImportantWordRanges(text, maxUnderlines = 2) {
  const ranges = []
  // Match word boundaries
  const regex = /\b([a-zA-Z]{6,})\b/g
  let match
  let count = 0

  while ((match = regex.exec(text)) !== null && count < maxUnderlines) {
    const word = match[1].toLowerCase()
    if (!SKIP_WORDS.has(word)) {
      ranges.push({ start: match.index, end: match.index + match[1].length })
      count++
    }
  }

  return ranges
}

/**
 * Build a Fabric `styles` object that underlines important words in body text.
 *
 * @param {string} text        - The body text
 * @param {string} primaryColor - Track primary color (hex)
 * @returns {object}           - Fabric styles object
 */
export function buildBodyStyles(text, primaryColor) {
  if (!text) return {}

  const underlineColor = primaryColor || UNDERLINE_COLORS.default
  const importantRanges = detectImportantWordRanges(text, 2)
  if (importantRanges.length === 0) return {}

  const lines = text.split('\n')
  const styles = {}
  let flatIdx = 0

  lines.forEach((line, lineIdx) => {
    for (let ci = 0; ci < line.length; ci++) {
      const isImportant = importantRanges.some(
        (r) => flatIdx >= r.start && flatIdx < r.end
      )
      if (isImportant) {
        if (!styles[lineIdx]) styles[lineIdx] = {}
        styles[lineIdx][ci] = {
          underline: true,
          fill: underlineColor,
          fontWeight: 'bold',
        }
      }
      flatIdx++
    }
    flatIdx++ // for \n
  })

  return styles
}
