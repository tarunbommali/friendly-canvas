import { RankingStrategy } from './RankingStrategy.js';

/**
 * Fuzzy Levenshtein Ranking Strategy
 * Handles typos and phonetic spelling variations with edit distance threshold.
 */
export class FuzzyLevenshteinStrategy extends RankingStrategy {
  /**
   * @param {number} [maxDistance=2]
   */
  constructor(maxDistance = 2) {
    super();
    this.maxDistance = maxDistance;
  }

  /**
   * Fast Levenshtein distance calculation with early exit
   * @param {string} a
   * @param {string} b
   * @returns {number}
   */
  static levenshteinDistance(a, b) {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;

    const row = [];
    for (let i = 0; i <= b.length; i++) {
      row[i] = i;
    }

    for (let i = 1; i <= a.length; i++) {
      let prev = i;
      for (let j = 1; j <= b.length; j++) {
        let val;
        if (a[i - 1] === b[j - 1]) {
          val = row[j - 1];
        } else {
          val = Math.min(row[j - 1] + 1, prev + 1, row[j] + 1);
        }
        row[j - 1] = prev;
        prev = val;
      }
      row[b.length] = prev;
    }

    return row[b.length];
  }

  score(query, queryTokens, document, docTokens) {
    if (!queryTokens || queryTokens.length === 0) return 0;

    const docTokenList = Array.from(docTokens);
    let totalScore = 0;

    for (const qToken of queryTokens) {
      if (qToken.length < 3) continue; // Don't fuzzy-match very short 1-2 char tokens

      let minDistance = Infinity;
      for (const dToken of docTokenList) {
        // Quick length difference check
        if (Math.abs(qToken.length - dToken.length) > this.maxDistance) continue;

        const dist = FuzzyLevenshteinStrategy.levenshteinDistance(qToken, dToken);
        if (dist < minDistance) {
          minDistance = dist;
          if (minDistance === 0) break;
        }
      }

      if (minDistance <= this.maxDistance) {
        // Normalize: distance 1 => 0.7 score, distance 2 => 0.4 score
        const tokenScore = 1 - minDistance / (this.maxDistance + 1);
        totalScore += tokenScore;
      }
    }

    return (totalScore / queryTokens.length) * 0.6;
  }
}
