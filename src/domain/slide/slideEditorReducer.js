/**
 * slideEditorReducer.js
 * ─────────────────────
 * Reducer-based command & transaction engine for visual slide editor.
 * Guarantees atomic history management with { past, present, future } stack,
 * resolving STATE-001 (incomplete history) and STATE-002 (stale historyIndex closures).
 */

export const EDITOR_ACTIONS = {
  SET_INITIAL_STATE: 'SET_INITIAL_STATE',
  ADD_ELEMENT: 'ADD_ELEMENT',
  UPDATE_ELEMENT: 'UPDATE_ELEMENT',
  UPDATE_ELEMENTS_BATCH: 'UPDATE_ELEMENTS_BATCH',
  DELETE_ELEMENT: 'DELETE_ELEMENT',
  MOVE_ELEMENT: 'MOVE_ELEMENT',
  REORDER_ELEMENTS: 'REORDER_ELEMENTS',
  UPDATE_CONFIG: 'UPDATE_CONFIG',
  UNDO: 'UNDO',
  REDO: 'REDO',
  RESET_HISTORY: 'RESET_HISTORY',
}

const MAX_HISTORY_LENGTH = 50

/**
 * Initial history wrapper state
 */
export function createInitialEditorState(initialElements = [], initialConfig = {}) {
  return {
    past: [],
    present: {
      elements: Array.isArray(initialElements) ? initialElements : [],
      config: initialConfig || {},
    },
    future: [],
  }
}

/**
 * Pushes the current present into past and returns new state with updated present.
 */
function recordTransaction(state, newPresent) {
  const newPast = [...state.past, state.present]
  if (newPast.length > MAX_HISTORY_LENGTH) {
    newPast.shift()
  }
  return {
    past: newPast,
    present: newPresent,
    future: [], // New mutation clears future stack
  }
}

export function slideEditorReducer(state, action) {
  switch (action.type) {
    case EDITOR_ACTIONS.SET_INITIAL_STATE: {
      const elements = action.payload.elements || []
      const config = action.payload.config || state.present.config
      return {
        past: [],
        present: { elements, config },
        future: [],
      }
    }

    case EDITOR_ACTIONS.ADD_ELEMENT: {
      const newElements = [...state.present.elements, action.payload.element]
      return recordTransaction(state, {
        ...state.present,
        elements: newElements,
      })
    }

    case EDITOR_ACTIONS.UPDATE_ELEMENT: {
      const { id, updates } = action.payload
      const newElements = state.present.elements.map(el =>
        el.id === id ? { ...el, ...updates } : el
      )
      return recordTransaction(state, {
        ...state.present,
        elements: newElements,
      })
    }

    case EDITOR_ACTIONS.UPDATE_ELEMENTS_BATCH: {
      const { elements } = action.payload
      return recordTransaction(state, {
        ...state.present,
        elements: Array.isArray(elements) ? elements : state.present.elements,
      })
    }

    case EDITOR_ACTIONS.DELETE_ELEMENT: {
      const { id } = action.payload
      const newElements = state.present.elements.filter(el => el.id !== id)
      return recordTransaction(state, {
        ...state.present,
        elements: newElements,
      })
    }

    case EDITOR_ACTIONS.MOVE_ELEMENT: {
      const { id, x, y, width, height } = action.payload
      const newElements = state.present.elements.map(el =>
        el.id === id ? { ...el, ...(x !== undefined ? { x } : {}), ...(y !== undefined ? { y } : {}), ...(width !== undefined ? { width } : {}), ...(height !== undefined ? { height } : {}) } : el
      )
      return recordTransaction(state, {
        ...state.present,
        elements: newElements,
      })
    }

    case EDITOR_ACTIONS.REORDER_ELEMENTS: {
      const { elements } = action.payload
      return recordTransaction(state, {
        ...state.present,
        elements: elements || state.present.elements,
      })
    }

    case EDITOR_ACTIONS.UPDATE_CONFIG: {
      const { updates } = action.payload
      const newConfig = {
        ...state.present.config,
        ...updates,
      }
      return recordTransaction(state, {
        ...state.present,
        config: newConfig,
      })
    }

    case EDITOR_ACTIONS.UNDO: {
      if (state.past.length === 0) return state
      const previous = state.past[state.past.length - 1]
      const newPast = state.past.slice(0, state.past.length - 1)
      return {
        past: newPast,
        present: previous,
        future: [state.present, ...state.future],
      }
    }

    case EDITOR_ACTIONS.REDO: {
      if (state.future.length === 0) return state
      const next = state.future[0]
      const newFuture = state.future.slice(1)
      return {
        past: [...state.past, state.present],
        present: next,
        future: newFuture,
      }
    }

    case EDITOR_ACTIONS.RESET_HISTORY: {
      return {
        past: [],
        present: state.present,
        future: [],
      }
    }

    default:
      return state
  }
}
