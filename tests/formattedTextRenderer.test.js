import { test } from 'node:test'
import assert from 'node:assert'
import { renderFormattedText } from '../src/shared/utils/formattedTextRenderer.js'

test('formattedTextRenderer: preserves surrounding whitespace when wrapping in bold tags', () => {
  const input = 'Gears and <b>levers</b> eventually replaced beads'
  const rendered = renderFormattedText(input)

  assert.ok(Array.isArray(rendered), 'Should return array of nodes')
  assert.strictEqual(rendered[0], 'Gears and ', 'Leading whitespace in adjacent plain text must be preserved')
  assert.strictEqual(rendered[1].type, 'strong', 'Tag should parse into strong')
  assert.strictEqual(rendered[1].props.children, 'levers', 'Inner content should match')
  assert.strictEqual(rendered[2], ' eventually replaced beads', 'Trailing whitespace in adjacent plain text must be preserved')
})

test('formattedTextRenderer: preserves surrounding whitespace with markdown bold and underline tags', () => {
  const input = 'Long before **machines**, we used <u>fingers</u> and stones.'
  const rendered = renderFormattedText(input)

  assert.ok(Array.isArray(rendered))
  assert.strictEqual(rendered[0], 'Long before ')
  assert.strictEqual(rendered[1].type, 'strong')
  assert.strictEqual(rendered[1].props.children, 'machines')
  assert.strictEqual(rendered[2], ', we used ')
  assert.strictEqual(rendered[3].type, 'u')
  assert.strictEqual(rendered[3].props.children, 'fingers')
  assert.strictEqual(rendered[4], ' and stones.')
})

test('formattedTextRenderer: preserves explicit newlines across multiline paragraphs', () => {
  const input = 'Line 1: overview\nLine 2: <b>bold point</b>\nLine 3: conclusion'
  const rendered = renderFormattedText(input)

  assert.ok(Array.isArray(rendered))
  assert.ok(rendered[0].includes('Line 1: overview\nLine 2: '))
  assert.strictEqual(rendered[1].type, 'strong')
  assert.strictEqual(rendered[1].props.children, 'bold point')
  assert.ok(rendered[2].includes('\nLine 3: conclusion'))
})
