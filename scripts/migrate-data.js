import fs from 'fs'
import path from 'path'

const rawPath = path.resolve('data.json')
const rawContent = fs.readFileSync(rawPath, 'utf8')
const raw = JSON.parse(rawContent)

// 1. Design System
const rawDS = raw.DesignSystem || {}
const layoutCategories = rawDS.LayoutCategorys || rawDS.layoutCategories || {}

const typography = rawDS.Typography || {
  headline: 'Bold geometric sans-serif (e.g. Sora, Poppins Bold)',
  body: 'Clean readable sans-serif (e.g. Inter, Poppins Regular)',
}

const iconography =
  rawDS.Iconography ||
  'Consistent line-art icon style, uniform stroke width, one accent color per track drawn from trackPalettes.'

const externalAssetConvention = rawDS.ExternalAssetConvention || {
  purpose: 'Flags slides whose visualDirective calls for a real photo, not an icon/diagram.',
  placeholderPattern: 'assets/photos/track{TT}_post{PPP}_slide{SS}.jpg',
  rule: 'Any slide without an externalAsset field uses the icon/diagram default.',
}

const audioConvention = rawDS.AudioConvention || {
  purpose: 'Each post carries a content-matched mood + search terms for picking a trending audio track at publish time.',
  rule: 'Do not hardcode a specific trending track — trends are ephemeral. Use searchTerms in the platform\'s trending-audio picker.',
}

const canvas = { width: 1080, height: 1350 }

// 2. Track Palettes keyed by "01", "02", etc.
const rawTrackPalettes = rawDS.TrackColorPalettes || {}
const trackPalettes = {}
const trackNames = Object.keys(rawTrackPalettes)

trackNames.forEach((trackName, idx) => {
  const trackId = String(idx + 1).padStart(2, '0')
  const entry = rawTrackPalettes[trackName] || {}
  trackPalettes[trackId] = {
    name: trackName,
    palette: entry.palette || entry.name || 'Default',
    primary: entry.primary || '#1E5FA8',
    accent: entry.accent || '#A9D0F5',
  }
})

// 3. Visual Glossary
const visualGlossary = raw.VisualGlossary || {}

// 4. Chapter Covers (Fixed & Standardized)
const rawCovers = raw.ChapterCovers || []
const chapterCovers = rawCovers.map((c, idx) => {
  const trackId = String(idx + 1).padStart(2, '0')
  const trackName = trackNames[idx] || c.Track || `Track ${idx + 1}`

  const title = c.Title || c.CoverHeadline || trackName
  const coverHeadline = c.CoverHeadline || c.Title || trackName
  const subtitle = c.Subtitle || c.subtitle || ''
  const visualDirective = c.VisualDirective || c.VisualPrompt || c.visualDirective || ''

  return {
    trackId,
    title,
    coverHeadline,
    subtitle,
    visualDirective,
  }
})

// 5. Posts (Cleaned, CamelCased, Deduplicated)
const rawPosts = raw.Posts || []
const posts = rawPosts.map((p, pIdx) => {
  // Extract track ID
  let trackId = '01'
  if (p.track?.id) {
    trackId = String(p.track.id).padStart(2, '0')
  } else if (p.TrackNo) {
    trackId = String(p.TrackNo).padStart(2, '0')
  } else if (p.Track) {
    const foundIdx = trackNames.findIndex((name) => name === p.Track)
    if (foundIdx >= 0) trackId = String(foundIdx + 1).padStart(2, '0')
  }

  const postNo = p.postNo || p.PostNo || pIdx + 1
  const id = p.id || `post_t${trackId}_p${String(postNo).padStart(2, '0')}`
  const title = p.title || p.PostTitle || `Post ${postNo}`
  const isFirstPostInTrack = Boolean(p.isFirstPostInTrack ?? p.IsFirstPostInTrack ?? postNo === 1)

  // Metadata
  const rawMeta = p.metadata || {}
  const rawAudio = rawMeta.suggestedAudio || p.SuggestedAudio || p.suggestedAudio || {}
  const suggestedAudio = {
    mood: typeof rawAudio === 'string' ? rawAudio : rawAudio.Mood || rawAudio.mood || 'Curious / Educational',
    searchTerms: Array.isArray(rawAudio.SearchTerms)
      ? rawAudio.SearchTerms
      : Array.isArray(rawAudio.searchTerms)
      ? rawAudio.searchTerms
      : ['tech education', 'coding carousel'],
    note: rawAudio.Note || rawAudio.note || 'Pick a currently trending sound at time of posting.',
  }

  const metadata = {
    createdAt: rawMeta.createdAt || new Date().toISOString(),
    updatedAt: rawMeta.updatedAt || new Date().toISOString(),
    description: rawMeta.description || p.Description || '',
    hashtags: rawMeta.hashtags || p.Hashtags || ['#SWENotebook', '#ZeroToHero', '#SoftwareEngineering'],
    suggestedAudio,
  }

  // Slides
  const rawSlides = p.slides || p.Slides || []
  const slides = rawSlides.map((s, sIdx) => {
    const slideNo = s.slideNo || s.SlideNo || sIdx + 1
    const slideId = s.id || `slide_t${trackId}_p${String(postNo).padStart(2, '0')}_s${String(slideNo).padStart(2, '0')}`
    const rawLayout = s.layout?.id || s.Layout || 'concept-explain'

    const slideContent = s.content || {}
    const content = {
      title: slideContent.title || s.SlideTitle || `Slide ${slideNo}`,
      body: slideContent.body || s.Content || '',
      visualDirective: slideContent.visualDirective || s.VisualDirective || '',
    }

    const config = {
      width: 1080,
      height: 1350,
      background: s.config?.background || '#F8F7F4',
      ...(s.config || {}),
    }
    config.width = 1080
    config.height = 1350

    return {
      id: slideId,
      slideNo,
      layout: {
        id: rawLayout,
        version: '1.0.0',
      },
      content,
      config,
      elements: s.elements || [],
      assets: s.assets || [],
    }
  })

  return {
    id,
    schemaVersion: '1.1.0',
    title,
    trackId,
    postNo,
    isFirstPostInTrack,
    metadata,
    slides,
  }
})

// Construct Modernized Canonical Project Data
const canonicalData = {
  slug: 'swe-notebook',
  name: 'SWE Notebook',
  designSystem: {
    layoutCategories,
    typography,
    iconography,
    externalAssetConvention,
    audioConvention,
    canvas,
  },
  visualGlossary,
  trackPalettes,
  chapterCovers,
  posts,
}

// Write to canonical files
const outputJson = JSON.stringify(canonicalData, null, 2)

const destPaths = [
  path.resolve('data.json'),
  path.resolve('src/shared/data/data.json'),
  path.resolve('src/projects/track-content/data.json'),
]

destPaths.forEach((dest) => {
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.writeFileSync(dest, outputJson, 'utf8')
  console.log(`Wrote migrated data.json to: ${dest}`)
})

console.log(`Migration complete!`)
console.log(`Tracks: ${Object.keys(trackPalettes).length}`)
console.log(`Chapter Covers: ${chapterCovers.length}`)
console.log(`Posts: ${posts.length}`)
