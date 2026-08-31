/**
 * Base Ranking Strategy Interface
 */
export class RankingStrategy {
  /**
   * @param {string} query
   * @param {string[]} queryTokens
   * @param {Object} document
   * @param {Set<string>} docTokens
   * @returns {number} Score from 0.0 to 1.0
   */
  score(query, queryTokens, document, docTokens) {
    throw new Error('Method score() must be implemented');
  }
}
