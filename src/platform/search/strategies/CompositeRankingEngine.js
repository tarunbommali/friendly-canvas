import { ExactMatchStrategy } from './ExactMatchStrategy.js';
import { PrefixMatchStrategy } from './PrefixMatchStrategy.js';
import { FuzzyLevenshteinStrategy } from './FuzzyLevenshteinStrategy.js';

/**
 * Composite Ranking Engine.
 * Aggregates weighted scores across multiple ranking strategies.
 */
export class CompositeRankingEngine {
  /**
   * @param {Array<{ strategy: import('./RankingStrategy.js').RankingStrategy, weight: number }>} [strategies]
   */
  constructor(strategies) {
    this.strategies = strategies || [
      { strategy: new ExactMatchStrategy(), weight: 1.0 },
      { strategy: new PrefixMatchStrategy(), weight: 0.7 },
      { strategy: new FuzzyLevenshteinStrategy(2), weight: 0.4 },
    ];
  }

  /**
   * Computes composite score for a document candidate
   * @param {string} query
   * @param {string[]} queryTokens
   * @param {Object} document
   * @param {Set<string>} docTokens
   * @returns {number} Aggregate normalized score
   */
  computeScore(query, queryTokens, document, docTokens) {
    let totalScore = 0;
    let totalWeight = 0;

    for (const { strategy, weight } of this.strategies) {
      const score = strategy.score(query, queryTokens, document, docTokens);
      totalScore += score * weight;
      totalWeight += weight;
    }

    return totalWeight === 0 ? 0 : totalScore / totalWeight;
  }
}
