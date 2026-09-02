import { test } from 'node:test'
import assert from 'node:assert'
import { compileLayoutToElements } from '../src/domain/layout/LayoutCompiler.js'

test('LayoutCompiler: compiles hook-open layout into badge, headline, and text elements', () => {
  const elements = compileLayoutToElements({
    layoutId: 'hook-open',
    content: {
      title: 'Why Computers Matter',
      body: 'They transform computation into physical actions.',
      visualDirective: 'Parchement style',
    },
    collectionPalette: { primary: '#8B5E3C', accent: '#D9C7A3', name: 'Sepia' },
    slideNo: 1,
    totalSlides: 7,
    collectionName: 'Collection 1 — Why Computers Exist',
  })

  assert.ok(elements.length >= 3, 'Must produce at least 3 elements')
  const headline = elements.find((el) => el.type === 'headline')
  const text = elements.find((el) => el.type === 'text')
  const badge = elements.find((el) => el.type === 'badge')

  assert.ok(headline, 'Must have headline element')
  assert.strictEqual(headline.content, 'Why Computers Matter')
  assert.ok(text, 'Must have body text element')
  assert.strictEqual(text.content, 'They transform computation into physical actions.')
  assert.ok(badge, 'Must have badge element')
})

test('LayoutCompiler: compiles comparison layout into left and right containers', () => {
  const elements = compileLayoutToElements({
    layoutId: 'comparison',
    content: {
      title: 'Monolith vs Microservices',
      leftTitle: 'Monolithic Architecture',
      leftContent: 'Single codebase, shared memory, simple deployment.',
      rightTitle: 'Microservices Architecture',
      rightContent: 'Independent services, network boundaries, distributed data.',
    },
    trackPalette: { primary: '#1E5FA8', accent: '#A9D0F5', name: 'Tech Blue' },
    slideNo: 4,
    totalSlides: 7,
  })

  assert.strictEqual(elements.length, 3)
  const leftCol = elements.find((el) => el.id.includes('col_left'))
  const rightCol = elements.find((el) => el.id.includes('col_right'))
  assert.ok(leftCol, 'Left column element exists')
  assert.ok(rightCol, 'Right column element exists')
  assert.ok(leftCol.content.includes('Monolithic Architecture'))
  assert.ok(rightCol.content.includes('Microservices Architecture'))
})
