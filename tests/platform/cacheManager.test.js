import test from 'node:test';
import assert from 'node:assert/strict';
import { LRUCacheStore } from '../../src/platform/cache/stores/LRUCacheStore.js';
import { TTLCacheStore } from '../../src/platform/cache/stores/TTLCacheStore.js';
import { InvalidationDAG } from '../../src/platform/cache/InvalidationDAG.js';
import { CacheManager } from '../../src/platform/cache/CacheManager.js';

test('Cache - LRUCache evicts least recently used items on overflow', () => {
  const cache = new LRUCacheStore(3);
  cache.set('a', 1);
  cache.set('b', 2);
  cache.set('c', 3);

  // Access 'a' to make it most recently used: MRU order is now a -> c -> b
  assert.equal(cache.get('a'), 1);

  // Insert 'd', should evict 'b'
  cache.set('d', 4);

  assert.equal(cache.get('b'), undefined, 'b should have been evicted');
  assert.equal(cache.get('a'), 1);
  assert.equal(cache.get('c'), 3);
  assert.equal(cache.get('d'), 4);
});

test('Cache - TTLCache expires items after ttl threshold', async () => {
  const cache = new TTLCacheStore(50); // 50ms TTL
  cache.set('temp', 'value');
  assert.equal(cache.get('temp'), 'value');

  await new Promise((r) => setTimeout(r, 60));

  assert.equal(cache.get('temp'), undefined, 'Expired entry should return undefined');
});

test('Cache - InvalidationDAG correctly resolves cascading dependencies', () => {
  const dag = new InvalidationDAG();
  // slide:1 -> layout:1, thumb:1
  // layout:1 -> export:1
  dag.addDependency('slide:1', 'layout:1');
  dag.addDependency('slide:1', 'thumb:1');
  dag.addDependency('layout:1', 'export:1');

  const dependents = dag.getDependents('slide:1');
  assert.deepEqual(
    new Set(dependents),
    new Set(['slide:1', 'layout:1', 'thumb:1', 'export:1']),
    'Cascading invalidation must resolve all downstream nodes'
  );
});

test('Cache - CacheManager invalidates dependent cache entries across namespaces', () => {
  const manager = new CacheManager();

  manager.set('layout', 'slide_101', { bounds: [0, 0, 100, 100] }, { dependencies: ['slide:101'] });
  manager.set('thumbnail', 'slide_101', { dataUrl: 'data:image/png;base64,...' }, { dependencies: ['slide:101'] });

  assert.ok(manager.get('layout', 'slide_101'));
  assert.ok(manager.get('thumbnail', 'slide_101'));

  // Mutating slide:101 triggers cascade
  const invalidated = manager.invalidateCascade('slide:101');
  assert.ok(invalidated.length >= 2);

  assert.equal(manager.get('layout', 'slide_101'), undefined);
  assert.equal(manager.get('thumbnail', 'slide_101'), undefined);
});
