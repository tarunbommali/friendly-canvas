import React from 'react'

/**
 * formattedTextRenderer.js
 * ────────────────────────
 * Parses inline markdown and HTML styling tags (bold, underline, italic,
 * highlight/accent, code) into React elements while strictly preserving
 * all surrounding whitespace, punctuation, and line breaks.
 *
 * Guarantees:
 * 1. Surrounding whitespace on adjacent text nodes is NEVER trimmed.
 * 2. Multi-line text with newlines (\n) is preserved.
 * 3. Words never merge together when wrapped in bold/underline tags.
 *
 * Supported tags:
 * - Bold: **text**, <b>text</b>, <strong>text</strong>
 * - Underline: <u>text</u>, __text__, ~text~
 * - Italic: *text*, _text_, <i>text</i>, <em>text</em>
 * - Highlight: <mark>text</mark>, ==text==, [accent]text[/accent]
 * - Code: `code`, <code>code</code>
 */
const TAG_REGEX = /(<b>[\s\S]*?<\/b>|<strong>[\s\S]*?<\/strong>|\*\*(?:(?!\*\*).)+\*\*|<u>[\s\S]*?<\/u>|__(?:(?!__).)+__|~(?:\S(?:[\s\S]*?\S)?)~|<mark>[\s\S]*?<\/mark>|==[\s\S]*?==|\[accent\][\s\S]*?\[\/accent\]|<i>[\s\S]*?<\/i>|<em>[\s\S]*?<\/em>|\*(?:(?!\*).)+\*|`[^`]+`|<code>[\s\S]*?<\/code>)/gi

export function renderFormattedText(text) {
  if (text === null || text === undefined) return null
  const str = String(text)
  if (!str) return ''

  const parts = str.split(TAG_REGEX)
  if (parts.length === 1) {
    return str
  }

  return parts.map((part, index) => {
    if (!part) return null

    // ── Bold tags ──
    if (part.startsWith('<b>') && part.endsWith('</b>')) {
      const inner = part.slice(3, -4)
      return React.createElement('strong', { key: index, className: 'font-bold text-slate-900' }, inner)
    }
    if (part.startsWith('<strong>') && part.endsWith('</strong>')) {
      const inner = part.slice(8, -9)
      return React.createElement('strong', { key: index, className: 'font-bold text-slate-900' }, inner)
    }
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      const inner = part.slice(2, -2)
      return React.createElement('strong', { key: index, className: 'font-bold text-slate-900' }, inner)
    }

    // ── Underline tags ──
    if (part.startsWith('<u>') && part.endsWith('</u>')) {
      const inner = part.slice(3, -4)
      return React.createElement('u', { key: index, className: 'underline decoration-2 underline-offset-2 decoration-amber-600/80' }, inner)
    }
    if (part.startsWith('__') && part.endsWith('__') && part.length >= 4) {
      const inner = part.slice(2, -2)
      return React.createElement('u', { key: index, className: 'underline decoration-2 underline-offset-2 decoration-amber-600/80' }, inner)
    }
    if (part.startsWith('~') && part.endsWith('~') && part.length >= 2) {
      const inner = part.slice(1, -1)
      return React.createElement('u', { key: index, className: 'underline decoration-2 underline-offset-2 decoration-amber-600/80' }, inner)
    }

    // ── Highlight / Accent tags ──
    if (part.startsWith('<mark>') && part.endsWith('</mark>')) {
      const inner = part.slice(6, -7)
      return React.createElement('mark', { key: index, className: 'bg-amber-200/70 text-slate-900 px-1 py-0.5 rounded font-semibold' }, inner)
    }
    if (part.startsWith('==') && part.endsWith('==') && part.length >= 4) {
      const inner = part.slice(2, -2)
      return React.createElement('mark', { key: index, className: 'bg-amber-200/70 text-slate-900 px-1 py-0.5 rounded font-semibold' }, inner)
    }
    if (part.startsWith('[accent]') && part.endsWith('[/accent]')) {
      const inner = part.slice(8, -9)
      return React.createElement('mark', { key: index, className: 'bg-amber-200/70 text-slate-900 px-1 py-0.5 rounded font-semibold' }, inner)
    }

    // ── Italic tags ──
    if (part.startsWith('<i>') && part.endsWith('</i>')) {
      const inner = part.slice(3, -4)
      return React.createElement('em', { key: index, className: 'italic' }, inner)
    }
    if (part.startsWith('<em>') && part.endsWith('</em>')) {
      const inner = part.slice(4, -5)
      return React.createElement('em', { key: index, className: 'italic' }, inner)
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      const inner = part.slice(1, -1)
      return React.createElement('em', { key: index, className: 'italic' }, inner)
    }

    // ── Code tags ──
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      const inner = part.slice(1, -1)
      return React.createElement('code', { key: index, className: 'font-mono bg-slate-100 px-1.5 py-0.5 rounded text-xs text-amber-800' }, inner)
    }
    if (part.startsWith('<code>') && part.endsWith('</code>')) {
      const inner = part.slice(6, -7)
      return React.createElement('code', { key: index, className: 'font-mono bg-slate-100 px-1.5 py-0.5 rounded text-xs text-amber-800' }, inner)
    }

    // ── Plain text segment: Strictly preserves adjacent whitespace ──
    return part
  })
}
