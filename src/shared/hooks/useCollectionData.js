import { useMemo } from 'react'
import data from '../data/project.json'
import { getNormalizedPalette } from '../utils/normalizedPalettes'

export function useCollectionData() {
  const designSystem = data.designSystem || {}
  const visualGlossary = data.visualGlossary || {}
  const rawCollections = Array.isArray(data.collections) ? data.collections : []
  const rawPosts = data.posts || []

  const { collectionThemes, collections, collectionIdMap, collectionList } = useMemo(() => {
    const palettesByCollectionName = {}
    const palettesByCollectionId = {}
    const collectionNamesList = []

    rawCollections.forEach((c) => {
      const idStr = String(c.collectionId).padStart(2, '0')
      const collectionNo = parseInt(idStr, 10)
      const name = c.collectionName || `Collection ${idStr}`
      const design = c.collectionDesign || {}
      const norm = getNormalizedPalette(name, {
        name,
        palette: design.palette || 'Default',
        primary: design.primary || '#2563eb',
        accent: design.accent || '#93c5fd',
      })
      palettesByCollectionName[name] = norm
      palettesByCollectionId[idStr] = norm
      palettesByCollectionId[String(collectionNo)] = norm
      collectionNamesList.push(name)
    })

    return {
      collectionThemes: palettesByCollectionName,
      collectionIdMap: palettesByCollectionId,
      collections: collectionNamesList,
      collectionList: rawCollections,
    }
  }, [rawCollections])

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
        const heading = s.heading || `Slide ${slideNo}`
        const bodyText = s.bodyText || ''
        const visualDirective = s.visualDirective || ''
        const layoutId = typeof s.layout === 'string' ? s.layout : (s.layout?.id || 'concept-explain')
        return {
          ...s,
          slideNo,
          heading,
          bodyText,
          visualDirective,
          layout: layoutId,
          archetypeKey: layoutId,
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
        designNo,
        postNo: designNo,
        slides: normalizedSlides,
        collectionName,
        trackColor: palette,
        palette,
        collection: collectionName,
        collectionNo: parseInt(collectionId, 10),
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
    watermarkBadge: data.watermarkBadge || '@swe.notebook',
    slidesConfig: data.slides || {},
    designSystem,
    visualGlossary,
    collections,
    collectionList,
    collectionThemes,
    collectionIdMap,
    designs,
    designsByCollection,
    posts: designs,
    postsByCollection: designsByCollection,
  }
}

export default useCollectionData
