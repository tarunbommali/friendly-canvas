import { RankingStrategy } from './RankingStrategy.js';

/**
 * Exact Match Ranking Strategy
 * Highest weight: matches full query or exact tokens in title/tags
 */
export class ExactMatchStrategy extends RankingStrategy {
  score(query, queryTokens, document, docTokens) {
    if (!query) return 0;
    const normalizedQuery = query.toLowerCase().trim();
    const title = (document.title || '').toLowerCase();

    // Direct exact title match
    if (title === normalizedQuery) return 1.0;

    // Title starts with exact query
    if (title.startsWith(normalizedQuery)) return 0.9;

    // Title contains full query as substring
    if (title.includes(normalizedQuery)) return 0.8;

    // Check token intersection
    let matchedTokens = 0;
    for (const qToken of queryTokens) {
      if (docTokens.has(qToken)) {
        matchedTokens++;
      }
    }

    if (queryTokens.length > 0 && matchedTokens === queryTokens.length) {
      return 0.75;
    }

    return queryTokens.length > 0 ? (matchedTokens / queryTokens.length) * 0.5 : 0;
  }
}
