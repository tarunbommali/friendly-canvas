import { test } from 'node:test'
import assert from 'node:assert'
import { getExportFilename } from '../src/projects/carousel-editor/canvas/exportRenderer.js'

test('getExportFilename: formats single slide filename as collection_{collectionNumber}_post_{postNo}.png', () => {
  const doc = {
    metadata: {
      collectionNumber: '01',
      postNo: '1',
    },
    slides: [{ id: 'slide_1' }],
  }
  const filename = getExportFilename(doc, null, 'png')
  assert.strictEqual(filename, 'collection_01_post_1.png')
})

test('getExportFilename: formats multi-slide carousel with slide index as collection_{collectionNumber}_post_{postNo}_slide_{n}.png', () => {
  const doc = {
    metadata: {
      collectionNumber: '02',
      postNo: 5,
    },
    slides: [{ id: 'slide_1' }, { id: 'slide_2' }, { id: 'slide_3' }],
  }
  const filename0 = getExportFilename(doc, 0, 'png')
  const filename1 = getExportFilename(doc, 1, 'png')
  assert.strictEqual(filename0, 'collection_02_post_5_slide_1.png')
  assert.strictEqual(filename1, 'collection_02_post_5_slide_2.png')
})

test('getExportFilename: formats json filename as collection_{collectionNumber}_post_{postNo}.json', () => {
  const doc = {
    metadata: {
      collectionNumber: '15',
      postNo: '12',
    },
    slides: [{ id: 'slide_1' }, { id: 'slide_2' }],
  }
  const filename = getExportFilename(doc, null, 'json')
  assert.strictEqual(filename, 'collection_15_post_12.json')
})

test('getExportFilename: normalizes post ID string like post_t01_p07 to 7', () => {
  const doc = {
    metadata: {
      collectionId: '01',
      postId: 'post_t01_p07',
    },
    slides: [{ id: 'slide_1' }],
  }
  const filename = getExportFilename(doc, null, 'png')
  assert.strictEqual(filename, 'collection_01_post_7.png')
})
