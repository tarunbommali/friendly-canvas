import { test } from 'node:test'
import assert from 'node:assert'
import {
  slideEditorReducer,
  createInitialEditorState,
  EDITOR_ACTIONS,
} from '../src/domain/slide/slideEditorReducer.js'

test('slideEditorReducer: adds elements and records history transactions', () => {
  const initial = createInitialEditorState([], { width: 540, height: 675 })
  assert.strictEqual(initial.past.length, 0)
  assert.strictEqual(initial.future.length, 0)
  assert.strictEqual(initial.present.elements.length, 0)

  // 1. Add element
  const actionAdd = {
    type: EDITOR_ACTIONS.ADD_ELEMENT,
    payload: {
      element: { id: 'el_1', type: 'headline', content: 'Intro', x: 50, y: 100 },
    },
  }
  const s1 = slideEditorReducer(initial, actionAdd)
  assert.strictEqual(s1.present.elements.length, 1)
  assert.strictEqual(s1.past.length, 1)
  assert.strictEqual(s1.future.length, 0)

  // 2. Update element
  const actionUpdate = {
    type: EDITOR_ACTIONS.UPDATE_ELEMENT,
    payload: { id: 'el_1', updates: { content: 'Updated Intro' } },
  }
  const s2 = slideEditorReducer(s1, actionUpdate)
  assert.strictEqual(s2.present.elements[0].content, 'Updated Intro')
  assert.strictEqual(s2.past.length, 2)

  // 3. Move element
  const actionMove = {
    type: EDITOR_ACTIONS.MOVE_ELEMENT,
    payload: { id: 'el_1', x: 80, y: 120 },
  }
  const s3 = slideEditorReducer(s2, actionMove)
  assert.strictEqual(s3.present.elements[0].x, 80)
  assert.strictEqual(s3.present.elements[0].y, 120)
  assert.strictEqual(s3.past.length, 3)

  // 4. Undo move
  const s4 = slideEditorReducer(s3, { type: EDITOR_ACTIONS.UNDO })
  assert.strictEqual(s4.present.elements[0].x, 50)
  assert.strictEqual(s4.past.length, 2)
  assert.strictEqual(s4.future.length, 1)

  // 5. Undo update
  const s5 = slideEditorReducer(s4, { type: EDITOR_ACTIONS.UNDO })
  assert.strictEqual(s5.present.elements[0].content, 'Intro')
  assert.strictEqual(s5.past.length, 1)
  assert.strictEqual(s5.future.length, 2)

  // 6. Redo update
  const s6 = slideEditorReducer(s5, { type: EDITOR_ACTIONS.REDO })
  assert.strictEqual(s6.present.elements[0].content, 'Updated Intro')
  assert.strictEqual(s6.past.length, 2)
  assert.strictEqual(s6.future.length, 1)

  // 7. Delete element
  const s7 = slideEditorReducer(s6, {
    type: EDITOR_ACTIONS.DELETE_ELEMENT,
    payload: { id: 'el_1' },
  })
  assert.strictEqual(s7.present.elements.length, 0)
  assert.strictEqual(s7.past.length, 3)
})
