import { useState, useCallback } from 'react'
import { CAROUSEL_TEMPLATES } from '../../carousel-editor/templates/SlideTemplates'
import { DEFAULT_SLIDE_CONFIG } from '../../carousel-editor/hooks/useSlideBuilder'
import { layoutCollectionsRepo } from '../../../infrastructure/persistence/localStorageRepository'

export function getDefaultCollections() {
  return Object.entries(CAROUSEL_TEMPLATES).map(([key, tpl], idx) => {
    const defaultLayout = {
      id: `layout-${key}-default`,
      name: `${tpl.name} (Default)`,
      description: tpl.description,
      icon: tpl.icon || '📐',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      config: {
        ...DEFAULT_SLIDE_CONFIG,
        ...(tpl.config || {}),
      },
      elements: (tpl.elements || []).map((el, eIdx) => ({
        ...el,
        id: `el_${key}_${eIdx + 1}`,
        zIndex: eIdx + 1,
      })),
      slots: {
        title: { type: 'text', required: true, label: 'Slide Title', default: 'Title' },
        content: { type: 'textarea', required: true, label: 'Content', default: 'Content text...' },
        visualDirective: { type: 'text', required: false, label: 'Visual Directive', default: '' },
      },
    }

    return {
      id: `collection-${key}`,
      archetypeKey: key,
      LayoutCategoryKey: key,
      name: tpl.name,
      badge: tpl.badge || `Slide ${idx + 1} · Category`,
      description: tpl.description,
      icon: tpl.icon || '📁',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      layouts: [defaultLayout],
    }
  })
}

export function useLayoutCollections() {
  const [collections, setCollections] = useState(() => {
    const saved = layoutCollectionsRepo.get()
    const isOldFormat =
      Array.isArray(saved) &&
      saved.some((c) => c.id === 'collection-carousel' || c.id === 'collection-social')

    if (Array.isArray(saved) && saved.length >= 10 && !isOldFormat) {
      return saved
    }
    const defaults = getDefaultCollections()
    layoutCollectionsRepo.set(defaults)
    return defaults
  })

  const persistCollections = useCallback((next) => {
    setCollections(next)
    layoutCollectionsRepo.set(next)
  }, [])

  const getCollection = useCallback(
    (collectionId) => {
      return collections.find((c) => c.id === collectionId) || null
    },
    [collections]
  )

  const createCollection = useCallback(
    (name, description = '', icon = '📁') => {
      const newCollection = {
        id: `collection_${Date.now()}`,
        name: name.trim(),
        description: description.trim(),
        icon,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        layouts: [],
      }
      const next = [...collections, newCollection]
      persistCollections(next)
      return newCollection
    },
    [collections, persistCollections]
  )

  const updateCollection = useCallback(
    (collectionId, updates) => {
      const next = collections.map((c) =>
        c.id === collectionId
          ? { ...c, ...updates, updatedAt: new Date().toISOString() }
          : c
      )
      persistCollections(next)
    },
    [collections, persistCollections]
  )

  const deleteCollection = useCallback(
    (collectionId) => {
      const next = collections.filter((c) => c.id !== collectionId)
      persistCollections(next)
    },
    [collections, persistCollections]
  )

  const addLayoutToCollection = useCallback(
    (collectionId, layoutData) => {
      const newLayout = {
        id: `layout_${Date.now()}`,
        name: layoutData.name || 'Untitled Layout',
        description: layoutData.description || '',
        icon: layoutData.icon || '📐',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        config: layoutData.config || DEFAULT_SLIDE_CONFIG,
        elements: layoutData.elements || [],
        slots: layoutData.slots || {
          title: { type: 'text', required: true, label: 'Title', default: 'Title' },
          content: { type: 'textarea', required: true, label: 'Content', default: 'Content...' },
          visualDirective: { type: 'text', required: false, label: 'Visual Directive', default: '' },
        },
      }

      const next = collections.map((c) =>
        c.id === collectionId
          ? {
              ...c,
              updatedAt: new Date().toISOString(),
              layouts: [...c.layouts, newLayout],
            }
          : c
      )
      persistCollections(next)
      return newLayout
    },
    [collections, persistCollections]
  )

  const updateLayout = useCallback(
    (collectionId, layoutId, updates) => {
      const next = collections.map((c) => {
        if (c.id !== collectionId) return c
        const updatedLayouts = c.layouts.map((l) =>
          l.id === layoutId
            ? { ...l, ...updates, updatedAt: new Date().toISOString() }
            : l
        )
        return { ...c, updatedAt: new Date().toISOString(), layouts: updatedLayouts }
      })
      persistCollections(next)
    },
    [collections, persistCollections]
  )

  const deleteLayout = useCallback(
    (collectionId, layoutId) => {
      const next = collections.map((c) => {
        if (c.id !== collectionId) return c
        return {
          ...c,
          updatedAt: new Date().toISOString(),
          layouts: c.layouts.filter((l) => l.id !== layoutId),
        }
      })
      persistCollections(next)
    },
    [collections, persistCollections]
  )

  const duplicateLayout = useCallback(
    (collectionId, layoutId) => {
      const collection = collections.find((c) => c.id === collectionId)
      if (!collection) return null
      const source = collection.layouts.find((l) => l.id === layoutId)
      if (!source) return null

      const duplicated = {
        ...source,
        id: `layout_${Date.now()}`,
        name: `${source.name} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        elements: source.elements.map((el, idx) => ({
          ...el,
          id: `el_dup_${Date.now()}_${idx + 1}`,
        })),
      }

      const next = collections.map((c) =>
        c.id === collectionId
          ? {
              ...c,
              updatedAt: new Date().toISOString(),
              layouts: [...c.layouts, duplicated],
            }
          : c
      )
      persistCollections(next)
      return duplicated
    },
    [collections, persistCollections]
  )

  const resetToDefaults = useCallback(() => {
    const defaults = getDefaultCollections()
    persistCollections(defaults)
    return defaults
  }, [persistCollections])

  const exportCollections = useCallback(() => {
    return JSON.stringify(collections, null, 2)
  }, [collections])

  const importCollections = useCallback(
    (jsonString) => {
      try {
        const parsed = JSON.parse(jsonString)
        if (!Array.isArray(parsed)) throw new Error('Root must be an array')
        persistCollections(parsed)
        return { success: true }
      } catch (err) {
        return { success: false, error: err.message }
      }
    },
    [persistCollections]
  )

  return {
    collections,
    getCollection,
    createCollection,
    updateCollection,
    deleteCollection,
    addLayoutToCollection,
    updateLayout,
    deleteLayout,
    duplicateLayout,
    resetToDefaults,
    exportCollections,
    importCollections,
  }
}
