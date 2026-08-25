import { useReducer, useCallback, useEffect } from 'react'
import {
  slideEditorReducer,
  createInitialEditorState,
  EDITOR_ACTIONS,
} from '../../../domain/slide/slideEditorReducer'

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'el_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36)
}

export const DEFAULT_ELEMENT_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  SHAPE: 'shape',
  ICON: 'icon',
  LOGO: 'logo',
  BADGE: 'badge',
  HEADLINE: 'headline',
}

export const DEFAULT_SLIDE_CONFIG = {
  width: 540,
  height: 675,
  background: '#FFFFFF',
  backgroundType: 'dots',
  header: {
    show: true,
    text: 'TRACK 01',
    font: { family: 'monospace', size: 12, weight: 'bold', color: '#1E5FA8' },
  },
  footer: {
    show: true,
    showSlideNumber: true,
    showSwipe: true,
    font: { family: 'sans-serif', size: 11, color: '#64748b' },
  },
  padding: 32,
  spacing: 16,
  totalSlides: 7,
  currentSlideNo: 1,
}

export function getDefaultElementProps(type) {
  const defaults = {
    [DEFAULT_ELEMENT_TYPES.TEXT]: {
      content: 'Double-click to edit text',
      font: { family: 'Georgia', size: 24, weight: 'bold', color: '#0f172a' },
      align: 'center',
      width: 380,
      height: 60,
      highlight: false,
      highlightColor: '#A9D0F5',
    },
    [DEFAULT_ELEMENT_TYPES.HEADLINE]: {
      content: 'Slide Headline',
      font: { family: 'Georgia', size: 32, weight: 'bold', color: '#0f172a' },
      align: 'left',
      width: 440,
      height: 80,
      style: {},
    },
    [DEFAULT_ELEMENT_TYPES.IMAGE]: {
      src: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
      width: 280,
      height: 180,
      fit: 'cover',
      borderRadius: 12,
      border: '1px solid rgba(0,0,0,0.1)',
    },
    [DEFAULT_ELEMENT_TYPES.SHAPE]: {
      shape: 'rectangle',
      fill: '#3b82f6',
      stroke: 'none',
      width: 120,
      height: 80,
      borderRadius: 8,
      opacity: 1,
    },
    [DEFAULT_ELEMENT_TYPES.ICON]: {
      icon: 'lightning',
      size: 48,
      color: '#f59e0b',
      width: 56,
      height: 56,
    },
    [DEFAULT_ELEMENT_TYPES.LOGO]: {
      src: '/logo.png',
      width: 70,
      height: 70,
    },
    [DEFAULT_ELEMENT_TYPES.BADGE]: {
      content: '[ T01 · Sepia ]',
      font: { family: 'monospace', size: 12, weight: 'bold', color: '#1E5FA8' },
      backgroundColor: 'rgba(30, 95, 168, 0.1)',
      borderColor: 'rgba(30, 95, 168, 0.3)',
      width: 140,
      height: 32,
    },
  }
  return defaults[type] || defaults[DEFAULT_ELEMENT_TYPES.TEXT]
}

export function useSlideBuilder(initialElements = [], initialConfig = DEFAULT_SLIDE_CONFIG) {
  const [state, dispatch] = useReducer(
    slideEditorReducer,
    createInitialEditorState(initialElements, initialConfig)
  )

  const { elements, config: slideConfig } = state.present
  const canUndo = state.past.length > 0
  const canRedo = state.future.length > 0

  // Synchronize when initial elements change from parent storyboard
  const setInitialState = useCallback((newElements, newConfig) => {
    dispatch({
      type: EDITOR_ACTIONS.SET_INITIAL_STATE,
      payload: { elements: newElements, config: newConfig },
    })
  }, [])

  // Add a new element (transaction)
  const addElement = useCallback((type, props = {}) => {
    const defaultProps = getDefaultElementProps(type)
    const newElement = {
      id: generateId(),
      type,
      ...defaultProps,
      ...props,
      x: props.x ?? Math.round(50 + Math.random() * 80),
      y: props.y ?? Math.round(120 + Math.random() * 100),
      width: props.width ?? defaultProps.width,
      height: props.height ?? defaultProps.height,
      zIndex: elements.length + 1,
    }
    dispatch({
      type: EDITOR_ACTIONS.ADD_ELEMENT,
      payload: { element: newElement },
    })
    return newElement
  }, [elements.length])

  // Update an element (transaction)
  const updateElement = useCallback((id, updates) => {
    dispatch({
      type: EDITOR_ACTIONS.UPDATE_ELEMENT,
      payload: { id, updates },
    })
  }, [])

  // Remove an element (transaction)
  const removeElement = useCallback((id) => {
    dispatch({
      type: EDITOR_ACTIONS.DELETE_ELEMENT,
      payload: { id },
    })
  }, [])

  // Duplicate an element (transaction)
  const duplicateElement = useCallback((id) => {
    const element = elements.find(el => el.id === id)
    if (element) {
      const newElement = {
        ...element,
        id: generateId(),
        x: Math.min(slideConfig.width - (element.width || 100), (element.x || 50) + 20),
        y: Math.min(slideConfig.height - (element.height || 50), (element.y || 50) + 20),
        zIndex: elements.length + 1,
      }
      dispatch({
        type: EDITOR_ACTIONS.ADD_ELEMENT,
        payload: { element: newElement },
      })
    }
  }, [elements, slideConfig.width, slideConfig.height])

  // Move an element (transaction)
  const moveElement = useCallback((id, x, y) => {
    dispatch({
      type: EDITOR_ACTIONS.MOVE_ELEMENT,
      payload: { id, x, y },
    })
  }, [])

  // Reorder elements (z-index) (transaction)
  const reorderElements = useCallback((id, direction) => {
    const index = elements.findIndex(el => el.id === id)
    if (index === -1) return
    const newIndex = direction === 'up'
      ? Math.min(elements.length - 1, index + 1)
      : Math.max(0, index - 1)
    if (newIndex === index) return

    const newElements = [...elements]
    const [element] = newElements.splice(index, 1)
    newElements.splice(newIndex, 0, element)
    const reordered = newElements.map((el, idx) => ({ ...el, zIndex: idx + 1 }))

    dispatch({
      type: EDITOR_ACTIONS.REORDER_ELEMENTS,
      payload: { elements: reordered },
    })
  }, [elements])

  // Get element by ID
  const getElementById = useCallback((id) => {
    return elements.find(el => el.id === id)
  }, [elements])

  // Update slide configuration (transaction)
  const updateSlideConfig = useCallback((updates) => {
    dispatch({
      type: EDITOR_ACTIONS.UPDATE_CONFIG,
      payload: { updates },
    })
  }, [])

  // Reset slide
  const resetSlide = useCallback(() => {
    dispatch({
      type: EDITOR_ACTIONS.SET_INITIAL_STATE,
      payload: { elements: [], config: DEFAULT_SLIDE_CONFIG },
    })
  }, [])

  // Load a template (transaction)
  const loadTemplate = useCallback((template) => {
    const freshElements = (template.elements || []).map((el, idx) => ({
      ...el,
      id: generateId(),
      zIndex: idx + 1,
    }))
    const freshConfig = {
      ...DEFAULT_SLIDE_CONFIG,
      ...(template.config || {}),
    }
    dispatch({
      type: EDITOR_ACTIONS.SET_INITIAL_STATE,
      payload: { elements: freshElements, config: freshConfig },
    })
  }, [])

  // Export slide data
  const exportSlide = useCallback(() => {
    return {
      config: slideConfig,
      elements: elements,
      timestamp: new Date().toISOString(),
    }
  }, [elements, slideConfig])

  // Undo / Redo
  const undo = useCallback(() => {
    dispatch({ type: EDITOR_ACTIONS.UNDO })
  }, [])

  const redo = useCallback(() => {
    dispatch({ type: EDITOR_ACTIONS.REDO })
  }, [])

  return {
    elements,
    addElement,
    updateElement,
    removeElement,
    duplicateElement,
    moveElement,
    reorderElements,
    getElementById,
    slideConfig,
    updateSlideConfig,
    resetSlide,
    loadTemplate,
    exportSlide,
    undo,
    redo,
    canUndo,
    canRedo,
    setInitialState,
  }
}
