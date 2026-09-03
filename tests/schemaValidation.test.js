import { test } from 'node:test'
import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateCanonicalPost } from '../src/domain/post/postModel.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

test('Canonical Schema: data.json Posts and Collections conform to updated schema contract', () => {
  const dataPath = path.resolve(__dirname, '../data.json')
  const raw = fs.readFileSync(dataPath, 'utf8')
  const data = JSON.parse(raw)

  // Verify collections schema
  assert.ok(Array.isArray(data.collections), 'data.collections must be an array')
  assert.strictEqual(data.chapterCovers, undefined, 'data.chapterCovers must be removed')
  assert.strictEqual(data.collectionPalettes, undefined, 'data.collectionPalettes must be removed')

  data.collections.forEach((col, idx) => {
    assert.ok(col.collectionId, `Collection at index ${idx} missing collectionId`)
    assert.ok(col.collectionName, `Collection at index ${idx} missing collectionName`)
    assert.ok(col.collectionDescription !== undefined, `Collection at index ${idx} missing collectionDescription`)
    assert.ok(col.collectionDesign, `Collection at index ${idx} missing collectionDesign`)
    assert.ok(col.collectionDesign.palette, `Collection at index ${idx} missing collectionDesign.palette`)
    assert.ok(col.collectionDesign.primary, `Collection at index ${idx} missing collectionDesign.primary`)
    assert.ok(col.collectionDesign.accent, `Collection at index ${idx} missing collectionDesign.accent`)
  })

  const posts = data.posts
  assert.ok(Array.isArray(posts), 'data.posts must be an array')
  assert.ok(posts.length > 0, 'data.posts must contain posts')

  // Validate every post and slide in data.json
  posts.forEach((post, index) => {
    const result = validateCanonicalPost(post)
    assert.strictEqual(
      result.valid,
      true,
      `Post index ${index} (${post.id || post.title}) failed validation: ${result.errors?.join(', ')}`
    )
    assert.ok(post.collectionId, 'Collection ID missing')
    assert.ok(post.slides.length > 0, 'Post must contain at least one slide')

    post.slides.forEach((slide, sIdx) => {
      assert.ok(slide.heading, `Slide ${sIdx + 1} in post ${post.id} missing heading`)
      assert.ok(slide.bodyText !== undefined, `Slide ${sIdx + 1} in post ${post.id} missing bodyText`)
      assert.strictEqual(slide.headline, undefined, `Slide ${sIdx + 1} in post ${post.id} contains dead field headline`)
      assert.strictEqual(slide.text, undefined, `Slide ${sIdx + 1} in post ${post.id} contains dead field text`)
    })
  })
})
