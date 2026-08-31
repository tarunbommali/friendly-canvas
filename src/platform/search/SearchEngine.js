import { Tokenizer } from './Tokenizer.js';
import { PrefixTrie } from './structures/Trie.js';
import { InvertedIndex } from './structures/InvertedIndex.js';
import { CompositeRankingEngine } from './strategies/CompositeRankingEngine.js';

/**
 * Enterprise Client-Side Search Engine.
 * Sub-16ms search-as-you-type indexing over tracks, posts, and slide content.
 */
export class SearchEngine {
  /**
   * @param {Object} [options]
   * @param {CompositeRankingEngine} [options.rankingEngine]
   */
  constructor(options = {}) {
    this.index = new InvertedIndex();
    this.trie = new PrefixTrie();
    this.rankingEngine = options.rankingEngine || new CompositeRankingEngine();
  }

  /**
   * Bulk index searchable items
   * @param {Array<Object>} documents
   */
  buildIndex(documents = []) {
    this.index.clear();
    this.trie.clear();

    for (const doc of documents) {
      this.indexDocument(doc);
    }
  }

  /**
   * Index a single document
   * @param {Object} doc
   */
  indexDocument(doc) {
    if (!doc || !doc.id) return;
    this.index.addDocument(doc);

    // Extract all tokens to feed the prefix trie
    const text = `${doc.title || ''} ${doc.subtitle || ''} ${(doc.tags || []).join(' ')}`;
    const tokens = Tokenizer.tokenize(text);
    for (const token of tokens) {
      this.trie.insert(token, doc.id);
    }
  }

  /**
   * Search as you type with instant token lookup, prefix traversal, and composite ranking.
   * @param {string} rawQuery
   * @param {Object} [options]
   * @param {number} [options.limit=20]
   * @param {string[]} [options.types]
   * @returns {{ results: Array<Object>, totalCount: number, durationMs: number }}
   */
  search(rawQuery, options = {}) {
    const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const query = (rawQuery || '').trim();
    const limit = options.limit || 20;

    if (!query) {
      const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
      return { results: [], totalCount: 0, durationMs: endTime - startTime };
    }

    const queryTokens = Tokenizer.tokenize(query);
    const candidateDocIds = new Set();

    // 1. Gather candidates from inverted index (exact tokens)
    for (const token of queryTokens) {
      const exactMatches = this.index.getPostings(token);
      for (const id of exactMatches) {
        candidateDocIds.add(id);
      }

      // 2. Gather candidates from Prefix Trie
      const prefixMatches = this.trie.searchPrefix(token);
      for (const id of prefixMatches) {
        candidateDocIds.add(id);
      }
    }

    // 3. If query contains no matching tokens or few candidates, include all docs for fuzzy scoring
    const candidates = candidateDocIds.size > 0
      ? Array.from(candidateDocIds).map((id) => this.index.getDocument(id)).filter(Boolean)
      : Array.from(this.index.documents.values());

    // 4. Filter by document types if specified
    const filteredCandidates = options.types && options.types.length > 0
      ? candidates.filter((c) => options.types.includes(c.type))
      : candidates;

    // 5. Score and rank candidates
    const scoredResults = [];
    for (const candidate of filteredCandidates) {
      const docTokens = this.index.docTokens.get(candidate.id) || new Set();
      const score = this.rankingEngine.computeScore(query, queryTokens, candidate, docTokens);

      if (score > 0.05) {
        scoredResults.push({
          document: candidate,
          score,
        });
      }
    }

    // Sort descending by score
    scoredResults.sort((a, b) => b.score - a.score);

    const paginatedResults = scoredResults.slice(0, limit).map((r) => ({
      ...r.document,
      _score: Number(r.score.toFixed(4)),
    }));

    const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();

    return {
      results: paginatedResults,
      totalCount: scoredResults.length,
      durationMs: endTime - startTime,
    };
  }
}

// Global Singleton Instance
export const globalSearchEngine = new SearchEngine();
