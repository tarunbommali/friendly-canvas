import test from 'node:test';
import assert from 'node:assert/strict';
import { LayoutEngine } from '../../src/domain/layout/LayoutEngine.js';
import { CacheManager } from '../../src/platform/cache/CacheManager.js';

test('LayoutEngine - Estimates text block height and line wrapping correctly', () => {
  const engine = new LayoutEngine(new CacheManager());

  const singleLineText = 'Short Title';
  const singleLineCount = engine.estimateLineCount(singleLineText, 80, 800);
  assert.equal(singleLineCount, 1);

  const longMultilineText =
    'This is an extremely detailed and comprehensive title explaining how distributed database consensus protocols like Raft and Paxos operate in production environments.';
  const multiLineCount = engine.estimateLineCount(longMultilineText, 80, 800);
  assert.ok(multiLineCount >= 3, `Expected multiLineCount >= 3, got ${multiLineCount}`);
});

test('LayoutEngine - Cascades element flow positions without overlapping', () => {
  const cacheManager = new CacheManager();
  const engine = new LayoutEngine({ cacheManager });

  const slide = {
    id: 'test-slide-1',
    elements: [
      { id: 'el-1', type: 'badge', content: 'SYSTEM DESIGN' },
      { id: 'el-2', type: 'headline', content: 'High-Throughput Message Brokers', fontSize: 80 },
      { id: 'el-3', type: 'body', content: 'Kafka partitions and log compaction strategies for low latency.', fontSize: 54 },
      { id: 'el-4', type: 'directive_card', height: 300 },
    ],
  };

  const layout = engine.computeSlideLayout(slide);

  assert.equal(layout.slideId, 'test-slide-1');
  assert.equal(layout.elements.length, 4);

  const badge = layout.elements.find((e) => e.type === 'badge');
  const headline = layout.elements.find((e) => e.type === 'headline');
  const body = layout.elements.find((e) => e.type === 'body');
  const card = layout.elements.find((e) => e.type === 'directive_card');

  // Verify vertical cascade: badge.y < headline.y < body.y < card.y
  assert.ok(badge.y < headline.y, 'Badge must be positioned above headline');
  assert.ok(headline.y + headline.height <= body.y, 'Headline must not overlap with body');
  assert.ok(body.y + body.height <= card.y, 'Body must not overlap with directive card');
  assert.equal(layout.isOverflowing, false);
});

test('LayoutEngine - Uses cache on subsequent calculations and invalidates on slide mutation', () => {
  const cacheManager = new CacheManager();
  const engine = new LayoutEngine({ cacheManager });

  const slide = {
    id: 'cache-slide-99',
    elements: [
      { id: 'h1', type: 'headline', content: 'Initial Title', fontSize: 80 },
    ],
  };

  // 1. Initial compute (Cache Miss)
  const l1 = engine.computeSlideLayout(slide);
  assert.equal(cacheManager.getMetrics().misses, 1);
  assert.equal(cacheManager.getMetrics().hits, 0);

  // 2. Repeat compute with same slide (Cache Hit)
  const l2 = engine.computeSlideLayout(slide);
  assert.equal(cacheManager.getMetrics().hits, 1);
  assert.deepEqual(l1, l2);

  // 3. Mutate slide title and invalidate
  cacheManager.invalidateCascade('slide:cache-slide-99');
  slide.elements[0].content = 'Updated Title That Is Much Longer';

  const l3 = engine.computeSlideLayout(slide);
  assert.equal(cacheManager.getMetrics().misses, 2);
  assert.notEqual(l1.elements[0].content, l3.elements[0].content);
});
