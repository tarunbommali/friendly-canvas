import React from 'react'
import { createRoot } from 'react-dom/client'
import html2canvas from 'html2canvas'
import SlideRenderer from '../projects/track-content/components/SlideRenderer'

// ── Persistent 1×1 canvas for reliable sRGB color conversion ───────────────
let colorCtx = null

function getColorContext() {
  if (!colorCtx) {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    colorCtx = canvas.getContext('2d', { willReadFrequently: true })
  }
  return colorCtx
}

/**
 * Convert any modern CSS color to legacy rgb/rgba format.
 */
function toLegacyColor(value) {
  if (!value || typeof value !== 'string') return 'rgba(0,0,0,0)'

  const trimmed = value.trim()
  const ctx = getColorContext()
  ctx.fillStyle = '#000000'

  try {
    const parseable = trimmed.replace(/\bcurrentcolor\b/gi, '#888888')
    ctx.fillStyle = parseable
    const serialized = ctx.fillStyle

    if (serialized && serialized !== '#000000') {
      return serialized
    }

    if (/^(#000|#000000|black|rgba?\(0,\s*0,\s*0)/i.test(trimmed)) {
      return '#000000'
    }
  } catch {}

  if (trimmed.includes('transparent') || trimmed.includes('0%')) {
    return 'rgba(0, 0, 0, 0)'
  }
  return 'rgba(128, 128, 128, 0.5)'
}

const MODERN_COLOR_RE = /\b(?:oklch|oklab|lch|lab|color-mix|color)\s*\(/i

/**
 * Replace all modern color functions in a CSS string with legacy rgba values.
 */
function replaceModernColors(cssText) {
  if (!cssText || !MODERN_COLOR_RE.test(cssText)) return cssText

  let result = ''
  let cursor = 0
  const regex = /\b(?:oklch|oklab|lch|lab|color-mix|color)\s*\(/gi
  let match

  while ((match = regex.exec(cssText)) !== null) {
    const start = match.index
    const openIndex = cssText.indexOf('(', start)
    if (openIndex === -1) break

    let depth = 0
    let endIndex = -1
    for (let i = openIndex; i < cssText.length; i++) {
      if (cssText[i] === '(') depth++
      else if (cssText[i] === ')') {
        depth--
        if (depth === 0) { endIndex = i; break }
      }
    }

    if (endIndex === -1) {
      result += cssText.slice(cursor, openIndex + 1)
      cursor = openIndex + 1
      regex.lastIndex = cursor
      continue
    }

    const functionCall = cssText.slice(start, endIndex + 1)
    result += cssText.slice(cursor, start)
    result += toLegacyColor(functionCall)
    cursor = endIndex + 1
    regex.lastIndex = cursor
  }

  result += cssText.slice(cursor)
  return result
}

/**
 * Dedicated Slide to Canvas Renderer
 * Mounts the table-based SlideRenderer offscreen, captures it with html2canvas,
 * and cleans up. Eliminates flexbox/CSS-variable quirks for pixel-perfect PNGs.
 */
export async function renderSlideToCanvas({
  slide,
  post,
  trackColor,
  slideNumber,
  totalSlides,
  isNextUp = false,
}) {
  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.left = '-9999px'
  container.style.top = '0'
  container.style.zIndex = '-9999'
  container.style.opacity = '0'
  container.style.pointerEvents = 'none'
  document.body.appendChild(container)

  const root = createRoot(container)

  root.render(
    React.createElement(SlideRenderer, {
      slide,
      post,
      trackColor,
      slideNumber,
      totalSlides,
      isNextUp,
    })
  )

  // Give React time to render and fonts to compute layout
  await new Promise((resolve) => setTimeout(resolve, 80))

  try {
    const targetElement = container.firstElementChild || container
    const canvas = await html2canvas(targetElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#FFFFFF',
      logging: false,
      onclone: (clonedDoc) => {
        const styleTags = clonedDoc.querySelectorAll('style')
        for (const styleTag of styleTags) {
          if (styleTag.textContent && MODERN_COLOR_RE.test(styleTag.textContent)) {
            styleTag.textContent = replaceModernColors(styleTag.textContent)
          }
        }
      },
    })
    return canvas
  } finally {
    root.unmount()
    if (container.parentNode) {
      container.parentNode.removeChild(container)
    }
  }
}

/**
 * Fallback direct element capture function with sanitization
 */
export async function captureSlideCanvas(element) {
  if (!element) return null

  return html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#FFFFFF',
    logging: false,
    onclone: (clonedDoc) => {
      const styleTags = clonedDoc.querySelectorAll('style')
      for (const styleTag of styleTags) {
        if (styleTag.textContent && MODERN_COLOR_RE.test(styleTag.textContent)) {
          styleTag.textContent = replaceModernColors(styleTag.textContent)
        }
      }
    },
  })
}

export default renderSlideToCanvas
