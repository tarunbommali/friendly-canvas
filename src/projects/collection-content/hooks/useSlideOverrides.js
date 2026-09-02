/**
 * useSlideOverrides.js
 * ─────────────────────
 * Persists per-slide field overrides and collection color overrides using LocalStorageRepository.
 */

import { useState, useCallback, useEffect } from 'react'
import { slideOverridesRepo, collectionColorsRepo } from '../../../infrastructure/persistence/localStorageRepository'

const GLOBAL_BG_KEY = 'swe_notebook_global_bg_style'

export function getStoredGlobalBackground() {
  try {
    return localStorage.getItem(GLOBAL_BG_KEY) || 'dots'
  } catch {
    return 'dots'
  }
}

function makeKey(trackName, postNo, slideNo) {
  return `${trackName}|${postNo}|${slideNo}`
}

export function useGlobalBackgroundStyle() {
  const [globalBg, setGlobalBgState] = useState(getStoredGlobalBackground)

  useEffect(() => {
    const handleBgChange = () => {
      setGlobalBgState(getStoredGlobalBackground())
    }
    window.addEventListener('storage', handleBgChange)
    window.addEventListener('storage-bg-update', handleBgChange)
    return () => {
      window.removeEventListener('storage', handleBgChange)
      window.removeEventListener('storage-bg-update', handleBgChange)
    }
  }, [])

  const setGlobalBg = useCallback((style) => {
    setGlobalBgState(style)
    try {
      localStorage.setItem(GLOBAL_BG_KEY, style)
    } catch {
      // LocalStorage write failed (private mode/quota)
    }
    window.dispatchEvent(new Event('storage-bg-update'))
  }, [])

  return [globalBg, setGlobalBg]
}

export function useCollectionColorOverride(collectionName) {
  const [colors, setColors] = useState(() => collectionColorsRepo.get() || {})

  const override = colors[collectionName] || null

  const setCollectionColor = useCallback((palette) => {
    setColors(prev => {
      const next = { ...prev, [collectionName]: palette }
      collectionColorsRepo.set(next)
      return next
    })
  }, [collectionName])

  const clearCollectionColor = useCallback(() => {
    setColors(prev => {
      const next = { ...prev }
      delete next[collectionName]
      collectionColorsRepo.set(next)
      return next
    })
  }, [collectionName])

  return {
    colorOverride: override,
    trackColorOverride: override,
    setTrackColor,
    clearTrackColor,
  }
}

export function useSlideOverrides(trackName, postNo, slideNo) {
  const [overrides, setAllOverrides] = useState(() => slideOverridesRepo.get() || {})
  const [globalBg, setGlobalBg] = useGlobalBackgroundStyle()

  const key = makeKey(trackName, postNo, slideNo)
  const currentOverrides = overrides[key] || {}

  const setField = useCallback((field, value) => {
    setAllOverrides(prev => {
      const existing = prev[key] || {}
      const updatedSlide = { ...existing, [field]: value }
      const next = { ...prev, [key]: updatedSlide }
      slideOverridesRepo.set(next)
      return next
    })
  }, [key])

  const setOverride = useCallback((slideIndexOrNo, fieldOrObj, maybeValue) => {
    const targetNo = typeof slideIndexOrNo === 'number' ? (slideIndexOrNo <= 0 ? 1 : slideIndexOrNo) : 1
    const slideKey = makeKey(trackName, postNo, targetNo)
    setAllOverrides(prev => {
      const existing = prev[slideKey] || {}
      const updates = typeof fieldOrObj === 'object' && fieldOrObj !== null
        ? fieldOrObj
        : { [fieldOrObj]: maybeValue }
      const updatedSlide = { ...existing, ...updates }
      const next = { ...prev, [slideKey]: updatedSlide }
      slideOverridesRepo.set(next)
      return next
    })
  }, [trackName, postNo])

  const clearOverride = useCallback((slideIndexOrNo, maybeField) => {
    const targetNo = typeof slideIndexOrNo === 'number' ? (slideIndexOrNo <= 0 ? 1 : slideIndexOrNo) : 1
    const slideKey = makeKey(trackName, postNo, targetNo)
    setAllOverrides(prev => {
      const next = { ...prev }
      if (!maybeField) {
        delete next[slideKey]
      } else if (next[slideKey]) {
        const updatedSlide = { ...next[slideKey] }
        delete updatedSlide[maybeField]
        next[slideKey] = updatedSlide
      }
      slideOverridesRepo.set(next)
      return next
    })
  }, [trackName, postNo])

  const clearAllForPost = useCallback(() => {
    setAllOverrides(prev => {
      const next = { ...prev }
      Object.keys(next).forEach(k => {
        if (k.startsWith(`${trackName}|${postNo}|`)) {
          delete next[k]
        }
      })
      slideOverridesRepo.set(next)
      return next
    })
  }, [trackName, postNo])

  const setMultipleFields = useCallback((fieldsObj) => {
    setAllOverrides(prev => {
      const existing = prev[key] || {}
      const updatedSlide = { ...existing, ...fieldsObj }
      const next = { ...prev, [key]: updatedSlide }
      slideOverridesRepo.set(next)
      return next
    })
  }, [key])

  const clearOverrides = useCallback(() => {
    setAllOverrides(prev => {
      const next = { ...prev }
      delete next[key]
      slideOverridesRepo.set(next)
      return next
    })
  }, [key])

  const clearAllOverrides = useCallback(() => {
    setAllOverrides({})
    slideOverridesRepo.set({})
  }, [])

  const hasOverride = useCallback((slideIndexOrNo, field) => {
    const targetNo = typeof slideIndexOrNo === 'number' ? (slideIndexOrNo <= 0 ? 1 : slideIndexOrNo) : 1
    const slideKey = makeKey(trackName, postNo, targetNo)
    if (field !== undefined) {
      return Boolean(overrides[slideKey] && overrides[slideKey][field] !== undefined)
    }
    return Boolean(overrides[slideKey] && Object.keys(overrides[slideKey]).length > 0)
  }, [trackName, postNo, overrides])

  const getEffectiveSlide = useCallback((arg1, arg2) => {
    let rawSlide = {}
    let slideNumber = 1

    if (typeof arg1 === 'number' && typeof arg2 === 'object' && arg2 !== null) {
      slideNumber = arg1
      rawSlide = arg2
    } else if (typeof arg1 === 'object' && arg1 !== null) {
      rawSlide = arg1
      slideNumber = typeof arg2 === 'number' ? arg2 + 1 : (rawSlide.SlideNo || rawSlide.slideNo || 1)
    } else if (typeof arg2 === 'object' && arg2 !== null) {
      rawSlide = arg2
      slideNumber = typeof arg1 === 'number' ? arg1 : (rawSlide.SlideNo || rawSlide.slideNo || 1)
    }

    const slideKey = makeKey(trackName, postNo, slideNumber)
    const o = overrides[slideKey] || {}

    const title = o.SlideTitle !== undefined
      ? o.SlideTitle
      : (rawSlide.SlideTitle || rawSlide.content?.title || rawSlide.title || `Slide ${slideNumber}`)
    
    const layout = o.Layout !== undefined
      ? o.Layout
      : (rawSlide.Layout || rawSlide.layout?.id || (typeof rawSlide.layout === 'string' ? rawSlide.layout : 'concept-explain'))

    const content = o.Content !== undefined
      ? o.Content
      : (rawSlide.Content || rawSlide.content?.body || rawSlide.content?.content || rawSlide.content?.explanation || (typeof rawSlide.content === 'string' ? rawSlide.content : '') || '')

    const visualDirective = o.VisualDirective !== undefined
      ? o.VisualDirective
      : (rawSlide.VisualDirective || rawSlide.content?.visualDirective || rawSlide.visualDirective || '')

    const backgroundType = o.BackgroundType !== undefined
      ? o.BackgroundType
      : (rawSlide.BackgroundType || rawSlide.config?.backgroundType || 'default')

    const externalAsset = o.ExternalAsset !== undefined
      ? o.ExternalAsset
      : (rawSlide.ExternalAsset || rawSlide.content?.externalAsset)

    return {
      ...rawSlide,
      SlideNo: slideNumber,
      slideNo: slideNumber,
      SlideTitle: title,
      title: title,
      Layout: layout,
      layout: typeof rawSlide.layout === 'object' ? { ...rawSlide.layout, id: layout } : { id: layout, version: '1.0.0' },
      Content: content,
      content: {
        ...(typeof rawSlide.content === 'object' ? rawSlide.content : {}),
        title,
        body: content,
        visualDirective,
      },
      VisualDirective: visualDirective,
      BackgroundType: backgroundType,
      ExternalAsset: externalAsset,
      hasCustomBg: Boolean(o.BackgroundType && o.BackgroundType !== 'default'),
    }
  }, [trackName, postNo, overrides])

  return {
    overrides: currentOverrides,
    allOverrides: overrides,
    setField,
    setMultipleFields,
    clearOverrides,
    clearAllOverrides,
    setOverride,
    clearOverride,
    clearAllForPost,
    hasOverride,
    getEffectiveSlide,
    globalBg,
    setGlobalBg,
  }
}
