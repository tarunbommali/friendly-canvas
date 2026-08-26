import { useState, useMemo, useCallback } from 'react'
import data from '../../../shared/data/data.json'
import { slideOverridesRepo } from '../../../infrastructure/persistence/localStorageRepository'

export function useProjectData(projectSlug = 'swe-notebook') {
  const [overrides, setOverrides] = useState(() => slideOverridesRepo.get() || {})

  const project = useMemo(() => {
    const rawTrackPalettes = data.trackPalettes || {}
    const trackPalettes = {}

    Object.entries(rawTrackPalettes).forEach(([trackId, val]) => {
      trackPalettes[trackId] = val
      trackPalettes[String(parseInt(trackId, 10))] = val
      if (val.name) trackPalettes[val.name] = val
    })

    return {
      id: 'swe-notebook',
      slug: data.slug || 'swe-notebook',
      title: data.name || 'SWE Notebook',
      description:
        'Complete Software Engineering Zero to Hero curriculum. Includes track-wise content management, post inspectors, interactive live slide studio, prompt copiers, and slide override editors.',
      stats: {
        trackCount: Object.keys(rawTrackPalettes).length,
        postCount: (data.posts || []).length,
      },
      config: {
        trackPalettes,
        background: { type: 'dots', color: '#F8F7F4' },
        canvasSpec: { width: 1080, height: 1350, padding: 48 },
        typography: {
          headline: {
            family: 'Instrument Serif, Playfair Display, Georgia, serif',
            weight: 'bold',
            defaultSize: 48,
          },
          body: {
            family: 'Inter, -apple-system, sans-serif',
            weight: '400',
            defaultSize: 22,
          },
          badge: {
            family: 'JetBrains Mono, monospace',
            weight: '700',
            defaultSize: 13,
          },
        },
      },
    }
  }, [])

  const tracks = useMemo(() => {
    const rawPalettes = data.trackPalettes || {}
    const rawPosts = data.posts || []

    const trackEntries = Object.entries(rawPalettes)
      .map(([trackId, p]) => {
        const match = p.name?.match(/\d+/)
        const trackNo = match ? parseInt(match[0], 10) : parseInt(trackId, 10)
        return { trackId: String(trackNo).padStart(2, '0'), trackNo, title: p.name, palette: p }
      })
      .sort((a, b) => a.trackNo - b.trackNo)

    return trackEntries.map(({ trackId, trackNo, title: trackName, palette }) => {
      const matchingPosts = rawPosts.filter((p) => p.trackId === trackId)

      const posts = matchingPosts.map((p, pIdx) => {
        const postNo = p.postNo || pIdx + 1
        const postId = String(postNo)
        const rawSlides = p.slides || []

        const slides = rawSlides.map((s, sIdx) => {
          const slideNo = s.slideNo || sIdx + 1
          const slideId =
            s.id || `slide_t${trackId}_p${String(postNo).padStart(2, '0')}_s${String(slideNo).padStart(2, '0')}`
          const legacyKey = `${trackName}|${postNo}|${slideNo}`
          const slideOverride = overrides[slideId] || overrides[legacyKey] || {}
          const layoutId = slideOverride.Layout || slideOverride.layout || s.layout?.id || 'concept-explain'
          const audio = p.metadata?.suggestedAudio || {}
          const audioTitle = typeof audio === 'string' ? audio : audio.mood || 'Lo-fi Tech Beats / Deep Focus Ambient'

          return {
            id: slideId,
            postId,
            order: slideNo,
            slideNo,
            archetypeKey: layoutId,
            layout: s.layout || { id: layoutId, version: '1.0.0' },
            content: {
              title: slideOverride.title ?? slideOverride.SlideTitle ?? (s.content?.title || `Slide ${slideNo}`),
              body: slideOverride.body ?? slideOverride.Content ?? (s.content?.body || ''),
              visualDirective: slideOverride.visualDirective ?? slideOverride.VisualDirective ?? (s.content?.visualDirective || ''),
            },
            elements: s.elements || [],
            slideConfig: s.config || { width: 1080, height: 1350, background: '#F8F7F4' },
            assets: {
              matched: (s.assets || []).map((a) => (typeof a === 'string' ? a : a.title || a.name)),
              uploaded: [],
            },
            musicReference: {
              id: `music_${trackId}_${postNo}`,
              title: audioTitle,
              mood: audio.mood,
              searchTerms: audio.searchTerms || [],
              notes: audio.note,
            },
          }
        })

        return {
          id: postId,
          trackId,
          order: postNo,
          postNo,
          code: `${trackNo}.${postNo}`,
          title: p.title || `Post ${postNo}`,
          status: 'ready',
          slideCount: slides.length,
          palette,
          slides,
          metadata: p.metadata || { description: '', hashtags: [], suggestedAudio: '' },
        }
      })

      return {
        id: trackId,
        projectId: 'swe-notebook',
        order: trackNo,
        trackNo,
        slug: `track-${trackId}`,
        title: trackName,
        postCount: posts.length,
        palette,
        posts,
      }
    })
  }, [overrides])

  const updateSlideContent = useCallback((postId, slideId, contentUpdates, trackName, postNo, slideNo) => {
    setOverrides((prev) => {
      const existingSlideId = prev[slideId] || {}
      const pascalUpdates = {}
      if (contentUpdates.title !== undefined) pascalUpdates.SlideTitle = contentUpdates.title
      if (contentUpdates.body !== undefined) pascalUpdates.Content = contentUpdates.body
      if (contentUpdates.visualDirective !== undefined) pascalUpdates.VisualDirective = contentUpdates.visualDirective

      const updatedObj = { ...existingSlideId, ...contentUpdates, ...pascalUpdates }
      const nextOverrides = { ...prev, [slideId]: updatedObj }

      if (trackName && postNo && slideNo) {
        const legacyKey = `${trackName}|${postNo}|${slideNo}`
        const existingLegacy = prev[legacyKey] || {}
        nextOverrides[legacyKey] = { ...existingLegacy, ...updatedObj }
      }

      slideOverridesRepo.set(nextOverrides)
      return nextOverrides
    })
  }, [])

  return { project, tracks, updateSlideContent }
}
