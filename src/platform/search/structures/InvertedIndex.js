import { Tokenizer } from '../Tokenizer.js';

/**
 * Inverted Index for fast keyword-based document lookup
 */
export class InvertedIndex {
  constructor() {
    /** @type {Map<string, Set<string>>} Token -> Set of Document IDs */
    this.postings = new Map();
    /** @type {Map<string, Object>} Doc ID -> Full Document Object */
    this.documents = new Map();
    /** @type {Map<string, Set<string>>} Doc ID -> Set of extracted tokens */
    this.docTokens = new Map();
  }

  /**
   * Add a searchable document into the index
   * @param {Object} doc - { id, title, subtitle, body, tags }
   */
  addDocument(doc) {
    if (!doc || !doc.id) return;
    this.documents.set(doc.id, doc);

    const textToTokenize = `${doc.title || ''} ${doc.subtitle || ''} ${doc.body || ''} ${(doc.tags || []).join(' ')}`;
    const tokens = Tokenizer.tokenize(textToTokenize);
    const tokenSet = new Set(tokens);

    this.docTokens.set(doc.id, tokenSet);

    for (const token of tokenSet) {
      if (!this.postings.has(token)) {
        this.postings.set(token, new Set());
      }
      this.postings.get(token).add(doc.id);
    }
  }

  /**
   * Look up exact document matches for a token
   * @param {string} token
   * @returns {Set<string>}
   */
  getPostings(token) {
    return this.postings.get(token.toLowerCase()) || new Set();
  }

  /**
   * Retrieve document by ID
   * @param {string} id
   * @returns {Object | undefined}
   */
  getDocument(id) {
    return this.documents.get(id);
  }

  /**
   * Get all indexed unique tokens
   * @returns {string[]}
   */
  getAllTokens() {
    return Array.from(this.postings.keys());
  }

  /**
   * Total number of documents indexed
   */
  get size() {
    return this.documents.size;
  }

  clear() {
    this.postings.clear();
    this.documents.clear();
    this.docTokens.clear();
  }
}
