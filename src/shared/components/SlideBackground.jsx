import { useMemo, useState, useEffect } from 'react'

const GLOBAL_BG_KEY = 'swe_notebook_global_bg_style'

export function getStoredGlobalBackground() {
  try {
    return localStorage.getItem(GLOBAL_BG_KEY) || 'dots'
  } catch {
    return 'dots'
  }
}

export function setStoredGlobalBackground(value) {
  try {
    localStorage.setItem(GLOBAL_BG_KEY, value)
    window.dispatchEvent(new Event('storage-bg-update'))
  } catch {
    // ignore
  }
}

/**
 * getBackgroundPreset(type, trackColor, options)
 * ------------------------------------------------
 * Convenience factory: pass a background type + the track's
 * { primary, accent } and get a config object that already looks good,
 * without hand-writing color stops for every card.
 */
export function getBackgroundPreset(type, trackColor = {}, options = {}) {
  const primary = trackColor?.primary || '#1E5FA8'
  const accent = trackColor?.accent || '#A9D0F5'
  const resolvedType = type || getStoredGlobalBackground()

  const presets = {
    solid: {
      type: 'solid',
      color: '#ffffff',
    },

    gradient: {
      type: 'gradient',
      shape: 'linear',
      angle: 135,
      stops: [
        { color: '#ffffff', at: '0%' },
        { color: accent, at: '100%' },
      ],
    },

    'gradient-radial': {
      type: 'gradient',
      shape: 'radial',
      origin: '25% 15%',
      stops: [
        { color: '#ffffff', at: '0%' },
        { color: accent, at: '85%' },
      ],
    },

    seamless: {
      type: 'seamless',
      image: options.image || null,
      index: options.index ?? 0,
      total: options.total ?? 7,
      direction: 'horizontal',
    },

    texture: {
      type: 'texture',
      style: 'paper',
      base: '#FFFFFF',
      color: primary,
      opacity: 0.35,
    },

    grain: {
      type: 'texture',
      style: 'grain',
      base: '#FFFFFF',
      opacity: 0.1,
    },

    blurPhoto: {
      type: 'blurPhoto',
      image: options.image || null,
      blur: 20,
      overlayColor: '#ffffff',
      overlayOpacity: 0.75,
      focalPoint: 'center',
    },

    blobs: {
      type: 'blobs',
      colors: [primary, accent],
      count: 3,
      opacity: 0.2,
      blur: 44,
    },

    dots: {
      type: 'pattern',
      style: 'dots',
      base: '#FFFFFF',
      color: primary,
      opacity: 0.14,
      spacing: 20,
    },

    grid: {
      type: 'pattern',
      style: 'grid',
      base: '#FFFFFF',
      color: primary,
      opacity: 0.1,
      spacing: 24,
    },

    watermark: {
      type: 'pattern',
      style: 'watermark',
      base: '#FFFFFF',
      color: primary,
      opacity: 0.05,
      watermarkText: options.watermarkText || 'BRAND',
    },

    glass: {
      type: 'glass',
      base: {
        type: 'gradient',
        shape: 'radial',
        origin: '30% 20%',
        stops: [
          { color: '#ffffff', at: '0%' },
          { color: accent, at: '80%' },
        ],
      },
    },
  }

  const preset = presets[resolvedType] || presets[getStoredGlobalBackground()] || presets.dots
  return { ...preset, ...options }
}

/** Flat list for populating a background-type picker UI. */
export const BACKGROUND_TYPE_OPTIONS = [
  { value: 'dots', label: 'Dot grid', category: 'Patterns & Grids' },
  { value: 'grid', label: 'Line grid', category: 'Patterns & Grids' },
  { value: 'texture', label: 'Paper texture', category: 'Textures' },
  { value: 'grain', label: 'Film grain', category: 'Textures' },
  { value: 'blobs', label: 'Abstract blobs', category: 'Abstract Shapes' },
  { value: 'watermark', label: 'Brand watermark', category: 'Patterns & Grids' },
  { value: 'gradient', label: 'Linear gradient', category: 'Gradients' },
  { value: 'gradient-radial', label: 'Radial gradient', category: 'Gradients' },
  { value: 'solid', label: 'Solid white', category: 'Solid Colors' },
  { value: 'glass', label: 'Glassmorphism', category: 'Glassmorphism' },
  { value: 'blurPhoto', label: 'Blurred photograph', category: 'Blurred Photographs' },
  { value: 'seamless', label: 'Seamless panorama', category: 'Seamless / Continuous' },
]

/**
 * SlideBackground component
 */
export default function SlideBackground({ config, seed = 0, className = '' }) {
  const [globalBg, setGlobalBg] = useState(getStoredGlobalBackground)

  useEffect(() => {
    const handleUpdate = () => {
      setGlobalBg(getStoredGlobalBackground())
    }
    window.addEventListener('storage', handleUpdate)
    window.addEventListener('storage-bg-update', handleUpdate)
    return () => {
      window.removeEventListener('storage', handleUpdate)
      window.removeEventListener('storage-bg-update', handleUpdate)
    }
  }, [])

  const activeConfig = useMemo(() => {
    if (!config) {
      return getBackgroundPreset(globalBg)
    }
    if (!config.type) {
      return { ...getBackgroundPreset(globalBg), ...config }
    }
    return config
  }, [config, globalBg])

  const type = activeConfig.type || globalBg

  const layer = useMemo(() => {
    switch (type) {
      case 'gradient':
        return <GradientLayer config={activeConfig} />
      case 'seamless':
        return <SeamlessLayer config={activeConfig} />
      case 'texture':
        return <TextureLayer config={activeConfig} />
      case 'blurPhoto':
        return <BlurPhotoLayer config={activeConfig} />
      case 'blobs':
        return <BlobsLayer config={activeConfig} seed={seed} />
      case 'pattern':
        return <PatternLayer config={activeConfig} />
      case 'glass':
        return <GlassLayer config={activeConfig} seed={seed} />
      case 'solid':
      default:
        return <SolidLayer config={activeConfig} />
    }
  }, [activeConfig, seed, type])

  return (
    <div className={`slide-bg-root absolute inset-0 z-0 overflow-hidden pointer-events-none ${className}`} data-bg-type={type} aria-hidden="true">
      {layer}
    </div>
  )
}

function SolidLayer({ config }) {
  const color = config.color || '#ffffff'
  return <div className="absolute inset-0" style={{ background: color }} />
}

function GradientLayer({ config }) {
  const {
    shape = 'linear',
    angle = 135,
    stops = [
      { color: '#ffffff', at: '0%' },
      { color: '#A9D0F5', at: '100%' },
    ],
  } = config

  const stopStr = stops.map((s) => `${s.color} ${s.at}`).join(', ')
  const image =
    shape === 'radial'
      ? `radial-gradient(circle at ${config.origin || '30% 20%'}, ${stopStr})`
      : `linear-gradient(${angle}deg, ${stopStr})`

  return <div className="absolute inset-0" style={{ backgroundImage: image }} />
}

function SeamlessLayer({ config }) {
  const { image, index = 0, total = 7, direction = 'horizontal' } = config
  if (!image) return <div className="absolute inset-0" style={{ background: '#ffffff' }} />

  const pct = total > 1 ? (index / (total - 1)) * 100 : 0

  const style =
    direction === 'horizontal'
      ? {
          backgroundImage: `url(${image})`,
          backgroundSize: `${total * 100}% 100%`,
          backgroundPosition: `${pct}% center`,
        }
      : {
          backgroundImage: `url(${image})`,
          backgroundSize: `100% ${total * 100}%`,
          backgroundPosition: `center ${pct}%`,
        }

  return <div className="absolute inset-0 bg-no-repeat" style={style} />
}

const TEXTURE_SVG = {
  grain: () => svgDataUri(`
    <filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/>
    <feColorMatrix type="saturate" values="0"/></filter>
    <rect width="100%" height="100%" filter="url(#n)" opacity="0.9"/>`),
  noise: () => svgDataUri(`
    <filter id="n"><feTurbulence type="turbulence" baseFrequency="0.6" numOctaves="2" stitchTiles="stitch"/>
    <feColorMatrix type="saturate" values="0"/></filter>
    <rect width="100%" height="100%" filter="url(#n)"/>`),
  paper: (color = '#ffffff') => svgDataUri(`
    <filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.02 0.25" numOctaves="4"/>
    <feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope="0.35"/></feComponentTransfer></filter>
    <rect width="100%" height="100%" fill="${encodeURIComponent(color)}"/>
    <rect width="100%" height="100%" filter="url(#n)"/>`),
  fabric: (color) => svgDataUri(`
    <pattern id="f" width="8" height="8" patternUnits="userSpaceOnUse">
      <path d="M0 0L8 8M8 0L0 8" stroke="${encodeURIComponent(color)}" stroke-width="0.6" opacity="0.5"/>
    </pattern>
    <rect width="100%" height="100%" fill="url(#f)"/>`),
}

function svgDataUri(inner) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240">${inner}</svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

function TextureLayer({ config }) {
  const { style = 'grain', color = '#1E5FA8', opacity = 0.4, base = '#FFFFFF' } = config
  const generator = TEXTURE_SVG[style] || TEXTURE_SVG.grain
  const resolvedColor = color.startsWith('var(') ? '#8a8d94' : color
  const dataUri = generator(resolvedColor)

  return (
    <div className="absolute inset-0" style={{ background: base }}>
      <div
        className="absolute inset-0 bg-repeat mix-blend-multiply"
        style={{ backgroundImage: `url("${dataUri}")`, opacity }}
      />
    </div>
  )
}

function BlurPhotoLayer({ config }) {
  const {
    image,
    blur = 18,
    overlayColor = '#ffffff',
    overlayOpacity = 0.6,
    focalPoint = 'center',
  } = config

  if (!image) return <div className="absolute inset-0" style={{ background: '#ffffff' }} />

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-[-6%] w-[112%] h-[112%] bg-cover bg-no-repeat scale-105"
        style={{
          backgroundImage: `url(${image})`,
          backgroundPosition: focalPoint,
          filter: `blur(${blur}px)`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{ background: overlayColor, opacity: overlayOpacity }}
      />
    </div>
  )
}

const BLOB_PATHS = [
  'M43.4,-58.4C55.6,-49.9,63.8,-34.6,67.4,-18.2C71,-1.9,70.1,15.5,62.6,29.6C55.1,43.7,41.1,54.5,25.6,60.9C10.1,67.3,-6.9,69.3,-22.6,64.9C-38.4,60.5,-52.8,49.7,-61.2,35.3C-69.6,20.9,-71.9,2.8,-67.8,-13.1C-63.7,-29,-53.1,-42.8,-39.9,-51.3C-26.7,-59.9,-13.3,-63.3,2.3,-66.3C17.9,-69.3,35.9,-72,43.4,-58.4Z',
  'M39.6,-51.4C50.3,-45.1,57,-31.9,60.8,-17.9C64.6,-3.9,65.4,10.9,60.5,23.7C55.6,36.5,45,47.3,32.2,54.6C19.4,61.9,4.4,65.7,-11.3,64.9C-27,64.1,-43.4,58.7,-53.7,47.5C-64,36.3,-68.2,19.2,-68.1,2.3C-68,-14.6,-63.6,-31.3,-53.3,-38.7C-43,-46.1,-26.8,-44.2,-12.1,-46.9C2.6,-49.6,20.9,-56.9,39.6,-51.4Z',
  'M46.5,-56.8C58.9,-47.7,66.6,-32.1,68.9,-16C71.2,0.1,68.1,16.7,59.6,29.9C51.1,43.1,37.2,52.9,21.9,58.7C6.6,64.5,-10.1,66.3,-25.5,61.7C-40.9,57.1,-55,46.1,-63.2,31.6C-71.4,17.1,-73.7,-0.9,-68.7,-16.4C-63.7,-31.9,-51.4,-44.9,-37.6,-53.6C-23.8,-62.3,-8.5,-66.7,5.7,-73.9C19.9,-81.1,34.1,-65.9,46.5,-56.8Z',
]

function BlobsLayer({ config, seed }) {
  const {
    colors = ['#1E5FA8', '#A9D0F5'],
    count = 3,
    opacity = 0.2,
    blur = 40,
  } = config

  const blobs = useMemo(() => {
    const items = []
    for (let i = 0; i < count; i++) {
      const s = (seed + i * 17) % 1000
      const path = BLOB_PATHS[(seed + i) % BLOB_PATHS.length]
      const color = colors[i % colors.length]
      const size = 55 + ((s * 7) % 35)
      const top = ((s * 13) % 70) - 10
      const left = ((s * 29) % 70) - 10
      const rotate = (s * 3) % 360
      items.push({ path, color, size, top, left, rotate, key: `${seed}-${i}` })
    }
    return items
  }, [count, colors, seed])

  return (
    <div className="absolute inset-0 bg-[#FFFFFF]">
      {blobs.map((b) => (
        <svg
          key={b.key}
          className="absolute aspect-square pointer-events-none"
          viewBox="-100 -100 200 200"
          style={{
            width: `${b.size}%`,
            top: `${b.top}%`,
            left: `${b.left}%`,
            transform: `rotate(${b.rotate}deg)`,
            filter: `blur(${blur}px)`,
            opacity,
          }}
        >
          <path d={b.path} fill={b.color} />
        </svg>
      ))}
    </div>
  )
}

function PatternLayer({ config }) {
  const {
    style = 'dots',
    color = '#1E5FA8',
    opacity = 0.14,
    spacing = 20,
    base = '#FFFFFF',
    watermarkText = '',
  } = config

  const resolvedColor = color.startsWith('var(') ? 'currentColor' : color

  let backgroundImage = 'none'
  let backgroundSize = `${spacing}px ${spacing}px`

  if (style === 'dots') {
    backgroundImage = `radial-gradient(${resolvedColor} 1.3px, transparent 1.3px)`
  } else if (style === 'grid') {
    backgroundImage = `
      linear-gradient(to right, ${resolvedColor} 1px, transparent 1px),
      linear-gradient(to bottom, ${resolvedColor} 1px, transparent 1px)`
  } else if (style === 'graph') {
    backgroundImage = `
      linear-gradient(to right, ${resolvedColor} 1px, transparent 1px),
      linear-gradient(to bottom, ${resolvedColor} 1px, transparent 1px)`
    backgroundSize = `${spacing}px ${spacing}px, ${spacing}px ${spacing}px`
  }

  return (
    <div className="absolute inset-0" style={{ background: base, color: resolvedColor }}>
      <div
        className="absolute inset-0"
        style={{ backgroundImage, backgroundSize, opacity }}
      />
      {style === 'watermark' && watermarkText && (
        <div
          className="absolute inset-0 flex items-center justify-center font-serif font-black text-8xl whitespace-nowrap select-none pointer-events-none"
          style={{ color: resolvedColor, opacity: opacity * 2 }}
        >
          {watermarkText}
        </div>
      )}
    </div>
  )
}

function GlassLayer({ config, seed }) {
  const base = config.base || { type: 'gradient' }
  return <SlideBackground config={base} seed={seed} className="slide-bg-glass-base" />
}
