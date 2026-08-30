/**
 * SWE Notebook — Content DNA Transformation Script
 *
 * Applies the 2026 Content Style Guide to data.json:
 *   - Drops `descriptionVisual` (icon-inventory field) from all slides
 *   - Drops `imagesNeeded` from all slides
 *   - Adds `vibe` (optional) only on slides that genuinely need staging
 *   - Rewrites `headline` and `text` in the Gen Z DNA voice
 *   - Transforms recap slides from topic-list summaries to screenshot-worthy takeaways
 *   - Transforms next-up/finale slides to carry an explicit save/share CTA (`cta` field)
 *   - Updates chapterCovers to drop descriptionVisual, add vibe, update text tone
 *
 * Usage: node scripts/transform-content.js
 * The original data.json is backed up to data.json.bak before any writes.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DATA_PATH = path.join(ROOT, 'data.json')
const BACKUP_PATH = path.join(ROOT, 'data.json.bak')

// ─── Anchor Analogy Universe ────────────────────────────────────────────────
// One analogy per domain, used consistently across the entire series.
const DOMAIN_ANALOGIES = {
  '08': 'the postal system',   // Networking
  '09': 'the postal system',   // How the Web Works (same domain)
  '13': 'locks, keys, and people trying to pick them', // Security
  '21': 'an intern with a task list and tools, not a chatbot', // AI Agents
  '04': 'a restaurant kitchen — one chef (CPU), many orders (processes)', // OS
  '12': 'a library with a card catalog', // Databases
  '15': 'renting a power outlet instead of buying a generator', // Cloud
  '16': 'building a city, not just a house', // System Design
  '17': 'a Swiss Army knife — one language, infinite use cases', // Data & Python
  '18': 'teaching by example, not by writing rules', // ML
  '19': 'a brain that learned by watching a billion examples', // Deep Learning
  '20': 'a very fast autocomplete that read the whole internet', // Gen AI
}

// ─── Vibe rules ──────────────────────────────────────────────────────────────
// Only emit a `vibe` field when the slide genuinely needs staging direction.
// Layouts that can stand on typography + colour alone get no vibe.
function deriveVibe(slide) {
  switch (slide.layout) {
    case 'process-flow':
      return 'step-by-step diagram, left-to-right, numbered steps'
    case 'comparison':
      return 'two-column split, contrasting halves, one key difference each side'
    case 'real-world':
      // Only add vibe for real genuine scenarios, not generic filler
      return null
    default:
      return null
  }
}

// ─── Headline transformations ────────────────────────────────────────────────
function transformHeadline(slide) {
  const h = slide.headline || ''
  const layout = slide.layout

  // Recap slides — replace generic "Quick Recap" with a save-nudge label
  if (layout === 'recap-close') {
    if (h === 'Quick Recap') return 'the one thing to screenshot'
    return h
  }

  // Next-up / finale — softer framing
  if (layout === 'next-up') {
    if (h === 'Series Finale') return 'you made it through the whole stack'
    if (h === 'Next Up' || h === 'next in the series') return 'next in the queue'
    return h
  }

  // Real-world generic fillers → more human label
  if (layout === 'real-world') {
    if (h === 'Real-World Example') return 'where you\'ll actually see this'
    if (h === 'Common Mistake to Avoid') return 'the mistake everyone makes with this'
    if (h === 'Try It Yourself') return 'quick exercise before you move on'
    return h
  }

  // Hook-open — leave content headlines as-is (they carry the topic),
  // but lowercase if it reads like a pure statement (not a question or name)
  if (layout === 'hook-open') {
    // If it's already a question, keep it
    if (h.endsWith('?')) return h
    // If it contains a proper noun pattern (capitalised words mid-string) keep case
    // Otherwise return as-is — headlines are already short enough
    return h
  }

  return h
}

// ─── Text transformations ────────────────────────────────────────────────────
function transformText(slide, post, trackId) {
  const t = (slide.text || '').trim()
  const layout = slide.layout

  // ── Recap slides ──────────────────────────────────────────────────────────
  // Replace the "Quick recap — this post covered: X; Y; Z." bullet-dump
  // with a single screenshottable takeaway sentence.
  if (layout === 'recap-close') {
    const recapPattern = /^Quick recap — this post covered:/i
    if (recapPattern.test(t)) {
      return buildRecapTakeaway(post, trackId)
    }
    return t
  }

  // ── Next-up / finale slides ───────────────────────────────────────────────
  if (layout === 'next-up') {
    // Keep the next-post preview text, strip the stiff "Up Next:" prefix
    const cleaned = t
      .replace(/^Up Next(?: —[^:]*)?:/i, '')
      .replace(/^Up Next:/i, '')
      .trim()

    // The CTA lives in the `cta` field; text just surfaces the preview
    if (slide.headline === 'Series Finale' || cleaned === '') {
      return 'that\'s the full journey — simple machines to AI agents, one post at a time.'
    }
    return cleaned
  }

  // ── Real-world generic filler ─────────────────────────────────────────────
  if (layout === 'real-world') {
    // Pattern 1: "This isn't just theory — "X" is something you'll actually..."
    const genericReal =
      /^This isn't just theory — ".*?" is something you'll actually run into on your first real project, in an interview, or debugging production at 2AM\./i
    if (genericReal.test(t)) {
      return buildRealWorldText(slide.headline, post, trackId)
    }

    // Pattern 2: "The most common mistake with "X": rushing past it..."
    const mistakePattern = /^The most common mistake with ".*?":/i
    if (mistakePattern.test(t)) {
      return 'don\'t rush past this one — it\'s the kind of gap that shows up months later, usually at the worst time.'
    }

    // Pattern 3: "Quick exercise: before the next post, try explaining..."
    const exercisePattern = /^Quick exercise: before the next post/i
    if (exercisePattern.test(t)) {
      return 'before the next post: explain this out loud in one sentence. if you can\'t, that\'s your cue to re-read it.'
    }

    return t
  }

  // ── Hook-open slides ──────────────────────────────────────────────────────
  // Soften overly academic openers but preserve the core content.
  if (layout === 'hook-open') {
    return softenHookText(t, trackId)
  }

  // ── Click-beat slides (concept-explain, process-flow, comparison) ─────────
  // Apply DNA voice: talk to the reader, plain English first.
  return softenClickText(t, trackId)
}

// ─── Recap takeaway builder ───────────────────────────────────────────────────
// Generates a single memorable sentence per post, not a topic list.
function buildRecapTakeaway(post, trackId) {
  const analogy = DOMAIN_ANALOGIES[trackId]
  const title = post.title.toLowerCase()

  if (analogy) {
    return `${title} — remember: ${analogy}. save this so the mental model sticks.`
  }

  // Generic fallback for tracks without a registered analogy
  return `${title} is the kind of thing that clicks once, then you see it everywhere. save this post for when you need to explain it.`
}

// ─── Real-world text builder ──────────────────────────────────────────────────
function buildRealWorldText(slideHeadline, post) {
  const concept = slideHeadline.toLowerCase()
  // If the headline is a generic label, fall back to post title
  const genericLabels = ['real-world example', 'where you\'ll actually see this']
  const subject = genericLabels.includes(concept) ? post.title.toLowerCase() : concept

  return `you'll run into ${subject} on your first real project — probably before you feel ready for it.`
}

// ─── Voice soften helpers ─────────────────────────────────────────────────────
function softenHookText(text) {
  // Remove overly stiff academic openers
  const replacements = [
    [/^At its core, /, ''],
    [/^In essence, /, ''],
    [/^Fundamentally, /, ''],
    [/^Put simply, /, ''],
  ]
  let result = text
  for (const [pattern, replacement] of replacements) {
    result = result.replace(pattern, replacement)
  }
  // Capitalise first char after replacements
  return result.charAt(0).toUpperCase() + result.slice(1)
}

function softenClickText(text) {
  const replacements = [
    // Passive → active voice openers
    [/^This is known as /, 'this is called '],
    [/^It is important to note that /, ''],
    [/^One important aspect of this is /, ''],
    [/^This concept refers to /, ''],
    // Over-academic distance → reader-addressed
    [/\bthe developer\b/g, 'you'],
    [/\bthe programmer\b/g, 'you'],
    [/\bthe user\b/g, 'you'],
    [/\bone can\b/g, 'you can'],
  ]
  let result = text
  for (const [pattern, replacement] of replacements) {
    result = result.replace(pattern, replacement)
  }
  return result
}

// ─── CTA builder ─────────────────────────────────────────────────────────────
function buildCTA(post, trackId, isFinale) {
  if (isFinale) {
    return 'save this series and share it with someone who needs to see the whole stack explained right — start to finish, no skips'
  }

  const title = post.title.toLowerCase()
  return `save this before you forget it, and send it to whoever keeps saying "${title} is too hard to understand"`
}

// ─── Chapter cover transformer ────────────────────────────────────────────────
function transformChapterCover(cover) {
  // Drop descriptionVisual; add a short vibe; nudge text to be save-prompting
  const existingText = (cover.text || '').trim()

  // Append series bookmark nudge if not already there
  const bookmarkNudge = 'bookmark this — 21 tracks, one complete system.'
  const text = existingText.endsWith(bookmarkNudge)
    ? existingText
    : existingText.replace(/\.$/, '') + ' ' + bookmarkNudge

  return {
    trackId: cover.trackId,
    headline: cover.headline,
    text,
    vibe: 'full-bleed chapter title card — track name large and bold, subtitle lighter weight, high-contrast on brand colour',
  }
}

// ─── Slide transformer ────────────────────────────────────────────────────────
function transformSlide(slide, post, trackId, isLastSlide) {
  const newSlide = {
    id: slide.id,
    slideNo: slide.slideNo,
    layout: slide.layout,
    headline: transformHeadline(slide, post, trackId),
    text: transformText(slide, post, trackId),
  }

  // Add vibe only where staging genuinely matters
  const vibe = deriveVibe(slide)
  if (vibe) newSlide.vibe = vibe

  // Add CTA only on the last slide of each post
  if (isLastSlide) {
    const isFinale = slide.layout === 'next-up' && slide.headline === 'Series Finale'
    newSlide.cta = buildCTA(post, trackId, isFinale)
  }

  // Fields deliberately dropped: descriptionVisual, imagesNeeded

  return newSlide
}

// ─── Main ─────────────────────────────────────────────────────────────────────
function main() {
  console.log('📖 Reading data.json...')
  const raw = fs.readFileSync(DATA_PATH, 'utf8')
  const data = JSON.parse(raw)

  // Backup
  fs.writeFileSync(BACKUP_PATH, raw, 'utf8')
  console.log(`✅ Backup written → data.json.bak (${(raw.length / 1024).toFixed(1)} KB)`)

  // ── Transform chapter covers ──────────────────────────────────────────────
  const originalCoverCount = (data.chapterCovers || []).length
  data.chapterCovers = (data.chapterCovers || []).map(transformChapterCover)
  console.log(`📑 Chapter covers transformed: ${originalCoverCount}`)

  // ── Transform posts ───────────────────────────────────────────────────────
  let totalSlides = 0
  let vibeCount = 0
  let ctaCount = 0
  let recapRewriteCount = 0
  let realWorldRewriteCount = 0

  data.posts = (data.posts || []).map((post) => {
    const trackId = post.trackId
    const slides = post.slides || []

    const newSlides = slides.map((slide, idx) => {
      const isLastSlide = idx === slides.length - 1
      const newSlide = transformSlide(slide, post, trackId, isLastSlide)

      // Tally stats
      totalSlides++
      if (newSlide.vibe) vibeCount++
      if (newSlide.cta) ctaCount++
      if (
        slide.layout === 'recap-close' &&
        /^Quick recap — this post covered:/i.test(slide.text || '')
      ) recapRewriteCount++
      if (
        slide.layout === 'real-world' &&
        /^This isn't just theory/i.test(slide.text || '')
      ) realWorldRewriteCount++

      return newSlide
    })

    return {
      id: post.id,
      title: post.title,
      trackId: post.trackId,
      postNo: post.postNo,
      slides: newSlides,
    }
  })

  // ── Write ─────────────────────────────────────────────────────────────────
  const output = JSON.stringify(data, null, 2)
  fs.writeFileSync(DATA_PATH, output, 'utf8')

  // Sync to all known copies of data.json inside the project
  const SYNC_PATHS = [
    path.join(ROOT, 'src', 'shared', 'data', 'data.json'),
    path.join(ROOT, 'src', 'projects', 'track-content', 'data.json'),
  ]
  for (const dest of SYNC_PATHS) {
    if (fs.existsSync(dest)) {
      fs.writeFileSync(dest, output, 'utf8')
      console.log(`🔄 Synced → ${path.relative(ROOT, dest)}`)
    }
  }

  // ── Validate ──────────────────────────────────────────────────────────────
  JSON.parse(fs.readFileSync(DATA_PATH, 'utf8')) // throws if invalid
  console.log('✅ JSON validation passed')

  // ── Stats ─────────────────────────────────────────────────────────────────
  console.log('\n── Transformation Summary ────────────────────────────────')
  console.log(`Posts transformed:          ${data.posts.length}`)
  console.log(`Total slides:               ${totalSlides}`)
  console.log(`descriptionVisual dropped:  ${totalSlides} (all slides)`)
  console.log(`imagesNeeded dropped:       ${totalSlides} (all slides)`)
  console.log(`vibe fields added:          ${vibeCount}`)
  console.log(`cta fields added:           ${ctaCount}`)
  console.log(`Recap slides rewritten:     ${recapRewriteCount}`)
  console.log(`Real-world fillers rewritten: ${realWorldRewriteCount}`)
  console.log(`Output size:                ${(output.length / 1024).toFixed(1)} KB`)
  console.log('──────────────────────────────────────────────────────────')
  console.log('\n🎉 Done. Review a few posts in `npm run dev` to spot-check.')
}

main()
