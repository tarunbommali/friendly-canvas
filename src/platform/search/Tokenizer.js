/**
 * Standard Stop Words Set for Software Engineering & Content Domain
 */
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'it', 'this', 'that',
]);

/**
 * Text Tokenizer with normalization, punctuation stripping, and token extraction.
 */
export class Tokenizer {
  /**
   * Tokenizes text into normalized unique keywords.
   * @param {string} text
   * @param {boolean} [filterStopWords=true]
   * @returns {string[]}
   */
  static tokenize(text, filterStopWords = true) {
    if (!text || typeof text !== 'string') return [];

    const tokens = text
      .toLowerCase()
      .replace(/[^a-z0-9_\-\s]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 1);

    if (!filterStopWords) return tokens;

    return tokens.filter((t) => !STOP_WORDS.has(t));
  }

  /**
   * Generate character n-grams for fuzzy indexing if needed
   * @param {string} token
   * @param {number} [n=3]
   * @returns {string[]}
   */
  static nGrams(token, n = 3) {
    if (token.length <= n) return [token];
    const grams = [];
    for (let i = 0; i <= token.length - n; i++) {
      grams.push(token.slice(i, i + n));
    }
    return grams;
  }
}
