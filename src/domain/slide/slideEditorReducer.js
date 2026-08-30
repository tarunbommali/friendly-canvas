/**
 * slideEditorReducer.js
 * Reducer for managing slide editor state with undo/redo history tracking.
 */

export const EDITOR_ACTIONS = {
  ADD_ELEMENT: 'ADD_ELEMENT',
  UPDATE_ELEMENT: 'UPDATE_ELEMENT',
  MOVE_ELEMENT: 'MOVE_ELEMENT',
  DELETE_ELEMENT: 'DELETE_ELEMENT',
  UNDO: 'UNDO',
  REDO: 'REDO',
}

export function createInitialEditorState(initialElements = [], config = {}) {
  return {
    past: [],
    present: {
      elements: Array.isArray(initialElements) ? initialElements : [],
      config,
    },
    future: [],
  }
}

export function slideEditorReducer(state, action) {
  const { past, present, future } = state

  switch (action.type) {
    case EDITOR_ACTIONS.ADD_ELEMENT: {
      const newElements = [...present.elements, action.payload.element]
      return {
        past: [...past, present],
        present: { ...present, elements: newElements },
        future: [],
      }
    }
    case EDITOR_ACTIONS.UPDATE_ELEMENT: {
      const newElements = present.elements.map((el) =>
        el.id === action.payload.id ? { ...el, ...action.payload.updates } : el
      )
      return {
        past: [...past, present],
        present: { ...present, elements: newElements },
        future: [],
      }
    }
    case EDITOR_ACTIONS.MOVE_ELEMENT: {
      const { id, x, y } = action.payload
      const newElements = present.elements.map((el) =>
        el.id === id ? { ...el, x, y } : el
      )
      return {
        past: [...past, present],
        present: { ...present, elements: newElements },
        future: [],
      }
    }
    case EDITOR_ACTIONS.DELETE_ELEMENT: {
      const newElements = present.elements.filter((el) => el.id !== action.payload.id)
      return {
        past: [...past, present],
        present: { ...present, elements: newElements },
        future: [],
      }
    }
    case EDITOR_ACTIONS.UNDO: {
      if (past.length === 0) return state
      const previous = past[past.length - 1]
      const newPast = past.slice(0, past.length - 1)
      return {
        past: newPast,
        present: previous,
        future: [present, ...future],
      }
    }
    case EDITOR_ACTIONS.REDO: {
      if (future.length === 0) return state
      const next = future[0]
      const newFuture = future.slice(1)
      return {
        past: [...past, present],
        present: next,
        future: newFuture,
      }
    }
    default:
      return state
  }
}
