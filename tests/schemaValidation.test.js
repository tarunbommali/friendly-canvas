import { test } from 'node:test'
import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateCanonicalPost } from '../src/domain/post/postModel.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

test('Canonical Schema: data.json Posts conform to v1.1.0 post contract', () => {
  const dataPath = path.resolve(__dirname, '../data.json')
  const raw = fs.readFileSync(dataPath, 'utf8')
  const data = JSON.parse(raw)

  const posts = data.posts || data.Posts
  assert.ok(Array.isArray(posts), 'data.posts must be an array')
  assert.ok(posts.length > 0, 'data.posts must contain posts')

  // Validate every post in data.json
  posts.forEach((post, index) => {
    const result = validateCanonicalPost(post)
    assert.strictEqual(
      result.valid,
      true,
      `Post index ${index} (${post.id || post.title}) failed validation: ${result.errors?.join(', ')}`
    )
    assert.ok(post.schemaVersion === '1.1.0' || post.schemaVersion === '1.0.0')
    assert.ok(post.trackId || post.track?.id, 'Track ID missing')
    assert.ok(post.slides.length > 0, 'Post must contain at least one slide')
  })
})
