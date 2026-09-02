import { useMemo } from 'react'
import data from '../data/data.json'
import { getNormalizedPalette } from '../utils/normalizedPalettes'

export function useCollectionData() {
  const designSystem = data.designSystem || {}
  const visualGlossary = data.visualGlossary || {}
  const chapterCovers = data.chapterCovers || []
  const rawPosts = data.posts || []
  const rawPalettes = data.collectionPalettes || {}

  const { collectionThemes, collections, collectionIdMap } = useMemo(() => {
    const palettesByCollectionName = {}
    const palettesByCollectionId = {}
    const collectionNamesList = []

    const sortedEntries = Object.entries(rawPalettes)
      .map(([collectionId, item]) => {
        const match = item.name?.match(/\d+/)
        const collectionNo = match ? parseInt(match[0], 10) : parseInt(collectionId, 10)
        return { collectionId, collectionNo, item }
      })
      .sort((a, b) => a.collectionNo - b.collectionNo)

    sortedEntries.forEach(({ collectionId, collectionNo, item }) => {
      const collectionName = item.name
      const norm = getNormalizedPalette(collectionName, item)
      palettesByCollectionName[collectionName] = norm
      palettesByCollectionId[collectionId] = norm
      palettesByCollectionId[String(collectionNo)] = norm
      palettesByCollectionId[String(collectionNo).padStart(2, '0')] = norm
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
      const collectionId = p.collectionId || String(idx + 1).padStart(2, '0')
      const collectionName =
        collectionIdMap[collectionId]?.name ||
        collections[parseInt(collectionId, 10) - 1] ||
        'Collection 1'
      const designNo = p.postNo || idx + 1
      const title = p.title || `Design ${designNo}`
      const slides = p.slides || []

      const normalizedSlides = slides.map((s, sIdx) => {
        const slideNo = s.slideNo || sIdx + 1
        // Support both flat schema (headline/text) and nested schema (content.title/body)
        const slideTitle = s.headline || s.title || s.content?.title || `Slide ${sIdx + 1}`
        const body = s.text || s.body || s.content?.body || ''
        const visualDirective = s.descriptionVisual || s.visualDirective || s.content?.visualDirective || ''
        // layout can be a string (flat schema) or an object with .id (nested schema)
        const layoutId = typeof s.layout === 'string' ? s.layout : (s.layout?.id || 'concept-explain')
        return {
          ...s,
          slideNo,
          SlideNo: slideNo,
          headline: slideTitle,
          title: slideTitle,
          SlideTitle: slideTitle,
          text: body,
          body,
          Content: body,
          visualDirective,
          VisualDirective: visualDirective,
          layout: layoutId,
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
        collectionId: collectionId,
        designNo,
        postNo: designNo,
        slides: normalizedSlides,
        collectionName,
        trackColor: palette,
        palette,
        collection: collectionName,
        collectionNo: parseInt(collectionId, 10),
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
    posts: designs,
    postsByCollection: designsByCollection,
    collectionPalettes: collectionThemes,
  }
}

export default useCollectionData
