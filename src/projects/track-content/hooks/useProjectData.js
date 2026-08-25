import { useState, useMemo, useCallback } from 'react'
import data from '../../../shared/data/data.json'
import { slideOverridesRepo } from '../../../infrastructure/persistence/localStorageRepository'

export function useProjectData(projectSlug = 'swe-notebook') {
  const [overrides, setOverrides] = useState(() => {
    return slideOverridesRepo.get() || {}
  })

  // Normalize project configuration according to Schema v1.1.0
  const project = useMemo(() => {
    const rawTrackPalettes = data.trackPalettes || data.DesignSystem?.TrackColorPalettes || {}
    const trackPalettes = {}

    Object.entries(rawTrackPalettes).forEach(([key, val], idx) => {
      const trackId = key.length <= 2 ? key : String(idx + 1).padStart(2, '0')
      trackPalettes[trackId] = val
      trackPalettes[String(parseInt(trackId, 10))] = val
      if (val.name) {
        trackPalettes[val.name] = val
      }
    })

    return {
      id: 'swe-notebook',
      slug: data.slug || 'swe-notebook',
      title: data.name || 'SWE Notebook',
      description:
        'Complete Software Engineering Zero to Hero curriculum. Includes track-wise content management, post inspectors, interactive live slide studio, prompt copiers, and slide override editors.',
      stats: {
        trackCount: Object.keys(rawTrackPalettes).length,
        postCount: (data.posts || data.Posts || []).length,
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

  // Normalize curriculum tracks and posts
  const tracks = useMemo(() => {
    const rawPalettes = data.trackPalettes || {}
    const rawPosts = data.posts || data.Posts || []

    const trackEntries = Object.entries(rawPalettes).length > 0
      ? Object.entries(rawPalettes).map(([trackId, p]) => ({
          trackId,
          trackNo: parseInt(trackId, 10),
          title: p.name,
          palette: p,
        }))
      : Object.keys(data.DesignSystem?.TrackColorPalettes || {}).map((name, idx) => ({
          trackId: String(idx + 1).padStart(2, '0'),
          trackNo: idx + 1,
          title: name,
          palette: data.DesignSystem?.TrackColorPalettes[name] || { primary: '#1E5FA8', accent: '#A9D0F5' },
        }))

    return trackEntries.map(({ trackId, trackNo, title: trackName, palette }) => {
      // Filter posts matching this track
      const matchingPosts = rawPosts.filter((p) => {
        const pTrackId = p.trackId || (p.track?.id ? String(p.track.id).padStart(2, '0') : null)
        if (pTrackId === trackId || pTrackId === String(trackNo)) return true
        if (p.Track === trackName || p.track?.name === trackName) return true
        return false
      })

      const posts = matchingPosts.map((p, pIdx) => {
        const postNo = p.postNo || p.PostNo || pIdx + 1
        const postId = String(postNo)
        const rawSlides = p.slides || p.Slides || []

        const slides = rawSlides.map((s, sIdx) => {
          const slideNo = s.slideNo || s.SlideNo || sIdx + 1
          const slideId =
            s.id || `slide_t${trackId}_p${String(postNo).padStart(2, '0')}_s${String(slideNo).padStart(2, '0')}`
          const slideOverride = overrides[slideId] || {}
          const rawLayout = s.layout?.id || s.Layout || 'concept-explain'

          const rawAudio = p.metadata?.suggestedAudio || p.SuggestedAudio || {}
          const audioTitle =
            typeof rawAudio === 'string'
              ? rawAudio
              : rawAudio.mood || rawAudio.Mood || 'Lo-fi Tech Beats / Deep Focus Ambient'

          return {
            id: slideId,
            postId,
            order: slideNo,
            slideNo,
            archetypeKey: rawLayout,
            layout: s.layout || { id: rawLayout, version: '1.0.0' },
            content: {
              title: slideOverride.title ?? (s.content?.title || s.SlideTitle || `Slide ${slideNo}`),
              body: slideOverride.body ?? (s.content?.body || s.Content || ''),
              visualDirective: slideOverride.visualDirective ?? (s.content?.visualDirective || s.VisualDirective || ''),
            },
            elements: s.elements || [],
            slideConfig: s.config || { width: 1080, height: 1350, background: '#F8F7F4' },
            assets: {
              matched: s.assets?.map((a) => (typeof a === 'string' ? a : a.title || a.name)) || [
                'Abacus (Vintage Computer)',
                'C Language Architecture',
              ],
              uploaded: [],
            },
            musicReference: {
              id: `music_${trackId}_${postNo}`,
              title: audioTitle,
              mood: rawAudio.mood || rawAudio.Mood,
              searchTerms: rawAudio.searchTerms || rawAudio.SearchTerms || [],
              notes: rawAudio.note || rawAudio.Note,
            },
          }
        })

        return {
          id: postId,
          trackId,
          order: postNo,
          postNo,
          code: `${trackNo}.${postNo}`,
          title: p.title || p.PostTitle || `Post ${postNo}`,
          status: 'ready',
          slideCount: slides.length,
          palette,
          slides,
          metadata: p.metadata || {
            description: p.Description || '',
            hashtags: p.Hashtags || [],
            suggestedAudio: p.SuggestedAudio || '',
          },
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

  // Update slide content with persistence
  const updateSlideContent = useCallback((postId, slideId, contentUpdates) => {
    setOverrides((prev) => {
      const existing = prev[slideId] || {}
      const nextOverrides = {
        ...prev,
        [slideId]: {
          ...existing,
          ...contentUpdates,
        },
      }
      slideOverridesRepo.set(nextOverrides)
      return nextOverrides
    })
  }, [])

  return {
    project,
    tracks,
    updateSlideContent,
  }
}
