import { useMemo } from 'react'
import data from '../data/data.json'
import { getNormalizedPalette } from '../../utils/normalizedPalettes'

export function useCollectionData() {
  const designSystem = data.designSystem || data.DesignSystem || {}
  const visualGlossary = data.visualGlossary || data.VisualGlossary || {}
  const chapterCovers = data.chapterCovers || data.ChapterCovers || []
  const rawPosts = data.posts || data.Posts || []

  // Normalized collection themes / palettes map
  const { collectionThemes, collections, collectionIdMap } = useMemo(() => {
    const rawPalettes = data.trackPalettes || designSystem.TrackColorPalettes || {}
    const palettesByCollectionName = {}
    const palettesByCollectionId = {}
    const collectionNamesList = []

    if (data.trackPalettes) {
      Object.entries(data.trackPalettes).forEach(([collectionId, item]) => {
        const collectionName = item.name
        const norm = getNormalizedPalette(collectionName, item)
        palettesByCollectionName[collectionName] = norm
        palettesByCollectionId[collectionId] = norm
        palettesByCollectionId[String(parseInt(collectionId, 10))] = norm
        collectionNamesList.push(collectionName)
      })
    } else {
      Object.entries(rawPalettes).forEach(([collectionName, rawPalette], idx) => {
        const collectionId = String(idx + 1).padStart(2, '0')
        const norm = getNormalizedPalette(collectionName, rawPalette)
        palettesByCollectionName[collectionName] = norm
        palettesByCollectionId[collectionId] = norm
        palettesByCollectionId[String(idx + 1)] = norm
        collectionNamesList.push(collectionName)
      })
    }

    return {
      collectionThemes: palettesByCollectionName,
      collectionIdMap: palettesByCollectionId,
      collections: collectionNamesList,
    }
  }, [designSystem])

  // Normalized designs / posts with aliases
  const designs = useMemo(() => {
    return rawPosts.map((p, idx) => {
      const collectionId = p.trackId || p.track?.id || String(p.TrackNo || 1).padStart(2, '0')
      const collectionName =
        collectionIdMap[collectionId]?.name ||
        p.track?.name ||
        p.Track ||
        collections[parseInt(collectionId, 10) - 1] ||
        'Collection 1'
      const designNo = p.postNo || p.PostNo || idx + 1
      const title = p.title || p.PostTitle || `Design ${designNo}`
      const slides = p.slides || p.Slides || []

      // Normalize slides
      const normalizedSlides = slides.map((s, sIdx) => ({
        ...s,
        slideNo: s.slideNo || s.SlideNo || sIdx + 1,
        SlideNo: s.slideNo || s.SlideNo || sIdx + 1,
        title: s.content?.title || s.SlideTitle || `Slide ${sIdx + 1}`,
        SlideTitle: s.content?.title || s.SlideTitle || `Slide ${sIdx + 1}`,
        body: s.content?.body || s.Content || '',
        Content: s.content?.body || s.Content || '',
        visualDirective: s.content?.visualDirective || s.VisualDirective || '',
        VisualDirective: s.content?.visualDirective || s.VisualDirective || '',
        archetypeKey: s.layout?.id || s.Layout || 'concept-explain',
        Layout: s.layout?.id || s.Layout || 'concept-explain',
      }))

      return {
        ...p,
        id: p.id || `post_t${collectionId}_p${String(designNo).padStart(2, '0')}`,
        title,
        collectionId,
        trackId: collectionId,
        designNo,
        postNo: designNo,
        slides: normalizedSlides,
        collectionName,
        // Legacy props for existing components
        Track: collectionName,
        TrackNo: parseInt(collectionId, 10),
        PostNo: designNo,
        PostTitle: title,
        Slides: normalizedSlides,
        Description: p.metadata?.description || p.Description || '',
        Hashtags: p.metadata?.hashtags || p.Hashtags || [],
        SuggestedAudio: p.metadata?.suggestedAudio || p.SuggestedAudio || {
          Mood: 'Curious / Educational',
          SearchTerms: ['tech beats', 'coding focus'],
        },
      }
    })
  }, [rawPosts, collectionIdMap, collections])

  const designsByCollection = useMemo(() => {
    const map = {}
    collections.forEach((c) => {
      map[c] = []
    })
    designs.forEach((d) => {
      const cName = d.collectionName
      if (!map[cName]) map[cName] = []
      map[cName].push(d)
    })
    return map
  }, [collections, designs])

  return {
    designSystem,
    visualGlossary,
    chapterCovers,
    // Modern SaaS Terminology
    collections,
    collectionThemes,
    collectionIdMap,
    designs,
    designsByCollection,
    // Backward Compatibility
    tracks: collections,
    trackPalettes: collectionThemes,
    trackIdMap: collectionIdMap,
    posts: designs,
    postsByTrack: designsByCollection,
  }
}

export default useCollectionData
