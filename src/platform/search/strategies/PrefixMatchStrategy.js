import { RankingStrategy } from './RankingStrategy.js';

/**
 * Prefix Match Ranking Strategy
 * Boosts candidates where doc tokens start with query tokens
 */
export class PrefixMatchStrategy extends RankingStrategy {
  score(query, queryTokens, document, docTokens) {
    if (!queryTokens || queryTokens.length === 0) return 0;

    let matchedPrefixes = 0;
    const docTokenList = Array.from(docTokens);

    for (const qToken of queryTokens) {
      const hasPrefixMatch = docTokenList.some((dToken) => dToken.startsWith(qToken));
      if (hasPrefixMatch) {
        matchedPrefixes++;
      }
    }

    return (matchedPrefixes / queryTokens.length) * 0.85;
  }
}
