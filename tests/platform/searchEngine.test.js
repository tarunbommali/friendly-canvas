import test from 'node:test';
import assert from 'node:assert/strict';
import { SearchEngine } from '../../src/platform/search/SearchEngine.js';
import { Tokenizer } from '../../src/platform/search/Tokenizer.js';
import { PrefixTrie } from '../../src/platform/search/structures/Trie.js';

test('Search - Tokenizer strips stop words and normalizes tokens', () => {
  const tokens = Tokenizer.tokenize('The Quick Brown Fox in the System Design Architecture!');
  assert.ok(tokens.includes('quick'));
  assert.ok(tokens.includes('brown'));
  assert.ok(tokens.includes('system'));
  assert.ok(tokens.includes('design'));
  assert.ok(!tokens.includes('the'), 'Stop word "the" must be filtered');
  assert.ok(!tokens.includes('in'), 'Stop word "in" must be filtered');
});

test('Search - PrefixTrie supports prefix matching', () => {
  const trie = new PrefixTrie();
  trie.insert('distributed', 'doc-1');
  trie.insert('database', 'doc-2');
  trie.insert('distributor', 'doc-3');

  const matches = trie.searchPrefix('dist');
  assert.deepEqual(matches, new Set(['doc-1', 'doc-3']));

  const noMatches = trie.searchPrefix('xyz');
  assert.equal(noMatches.size, 0);
});

test('Search - SearchEngine ranks exact, prefix, and fuzzy queries with sub-16ms SLA', () => {
  const engine = new SearchEngine();

  const dataset = [
    { id: '1', title: 'Distributed Systems Patterns', subtitle: 'Consensus & Raft', tags: ['architecture', 'raft'] },
    { id: '2', title: 'Database Indexing Techniques', subtitle: 'B-Trees and LSM Trees', tags: ['database', 'storage'] },
    { id: '3', title: 'System Design Interview Guide', subtitle: 'High-level architectures', tags: ['interview', 'systems'] },
    { id: '4', title: 'Redis In-Memory Caching', subtitle: 'LRU Eviction & Replication', tags: ['redis', 'caching'] },
  ];

  engine.buildIndex(dataset);

  // Exact Match Query
  const exactRes = engine.search('Redis');
  assert.equal(exactRes.results[0].id, '4');
  assert.ok(exactRes.durationMs < 16, 'Search query must execute within 16ms SLA');

  // Prefix Match Query
  const prefixRes = engine.search('distrib');
  assert.equal(prefixRes.results[0].id, '1');

  // Fuzzy Match Query with intentional typo ("databse" instead of "database")
  const fuzzyRes = engine.search('databse');
  assert.ok(fuzzyRes.results.length > 0);
  assert.equal(fuzzyRes.results[0].id, '2');
});
