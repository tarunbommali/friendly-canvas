import { useMemo } from 'react'
import data from '../data/data.json'
import { getNormalizedPalette } from '../utils/normalizedPalettes'

export function useCollectionData() {
  const designSystem = data.designSystem || {}
  const visualGlossary = data.visualGlossary || {}
  const chapterCovers = data.chapterCovers || []
  const rawPosts = data.posts || []
  const rawPalettes = data.trackPalettes || {}

  const { collectionThemes, collections, collectionIdMap } = useMemo(() => {
    const palettesByCollectionName = {}
    const palettesByCollectionId = {}
    const collectionNamesList = []

    const sortedEntries = Object.entries(rawPalettes)
      .map(([collectionId, item]) => {
        const match = item.name?.match(/\d+/)
        const trackNo = match ? parseInt(match[0], 10) : parseInt(collectionId, 10)
        return { collectionId, trackNo, item }
      })
      .sort((a, b) => a.trackNo - b.trackNo)

    sortedEntries.forEach(({ collectionId, trackNo, item }) => {
      const collectionName = item.name
      const norm = getNormalizedPalette(collectionName, item)
      palettesByCollectionName[collectionName] = norm
      palettesByCollectionId[collectionId] = norm
      palettesByCollectionId[String(trackNo)] = norm
      palettesByCollectionId[String(trackNo).padStart(2, '0')] = norm
      collectionNamesList.push(collectionName)
    })

    return {
      collectionThemes: palettesByCollectionName,
      collectionIdMap: palettesByCollectionId,
      collections: collectionNamesList,
    }
  }, [rawPalettes])

  const designs = useMemo(() => {
    return rawPosts.map((p, idx) => {
      const collectionId = p.trackId || String(idx + 1).padStart(2, '0')
      const collectionName =
        collectionIdMap[collectionId]?.name ||
        collections[parseInt(collectionId, 10) - 1] ||
        'Collection 1'
      const designNo = p.postNo || idx + 1
      const title = p.title || `Design ${designNo}`
      const slides = p.slides || []

      const normalizedSlides = slides.map((s, sIdx) => {
        const slideNo = s.slideNo || sIdx + 1
        const slideTitle = s.content?.title || `Slide ${sIdx + 1}`
        const body = s.content?.body || ''
        const visualDirective = s.content?.visualDirective || ''
        const layoutId = s.layout?.id || 'concept-explain'
        return {
          ...s,
          slideNo,
          SlideNo: slideNo,
          title: slideTitle,
          SlideTitle: slideTitle,
          body,
          Content: body,
          visualDirective,
          VisualDirective: visualDirective,
          archetypeKey: layoutId,
          Layout: layoutId,
        }
      })

      const palette =
        collectionIdMap[collectionId] ||
        collectionThemes[collectionName] ||
        { primary: '#C84B31', accent: '#FAD4C0' }

      const audio = p.metadata?.suggestedAudio
      const suggestedAudio = audio
        ? { Mood: audio.mood, SearchTerms: audio.searchTerms || [], Note: audio.note }
        : { Mood: 'Curious / Educational', SearchTerms: ['tech beats', 'coding focus'] }

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
        trackColor: palette,
        palette,
        // Legacy props for existing components
        Track: collectionName,
        TrackNo: parseInt(collectionId, 10),
        PostNo: designNo,
        PostTitle: title,
        Slides: normalizedSlides,
        Description: p.metadata?.description || '',
        Hashtags: p.metadata?.hashtags || [],
        SuggestedAudio: suggestedAudio,
      }
    })
  }, [rawPosts, collectionIdMap, collectionThemes, collections])

  const designsByCollection = useMemo(() => {
    const map = {}
    collections.forEach((c) => { map[c] = [] })
    designs.forEach((d) => {
      if (!map[d.collectionName]) map[d.collectionName] = []
      map[d.collectionName].push(d)
    })
    return map
  }, [collections, designs])

  return {
    designSystem,
    visualGlossary,
    chapterCovers,
    collections,
    collectionThemes,
    collectionIdMap,
    designs,
    designsByCollection,
    // Backward compatibility
    tracks: collections,
    trackPalettes: collectionThemes,
    trackIdMap: collectionIdMap,
    posts: designs,
    postsByTrack: designsByCollection,
  }
}

export default useCollectionData
