import { TargetingStrategy } from './TargetingStrategy.js';

/**
 * Deterministic Percentage Rollout Strategy using 32-bit FNV-1a Hash.
 * Guarantees sticky user bucketing in range [0, 99].
 */
export class PercentageRolloutStrategy extends TargetingStrategy {
  canHandle(rule) {
    return rule.type === 'PERCENTAGE';
  }

  /**
   * Computes a 32-bit FNV-1a hash of the given string and normalizes to 0-99.
   * @param {string} input
   * @returns {number} Integer between 0 and 99
   */
  static hashToPercentage(input) {
    let hash = 0x811c9dc5; // 2166136261 (32-bit FNV offset basis)
    for (let i = 0; i < input.length; i++) {
      hash ^= input.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193); // 16777619 (32-bit FNV prime)
    }
    // Convert to unsigned 32-bit integer and modulo 100
    return Math.abs(hash >>> 0) % 100;
  }

  evaluate(rule, context) {
    const identifier = context.userId || context.tenantId || 'anonymous';
    const salt = rule.id || 'default-salt';
    const bucket = PercentageRolloutStrategy.hashToPercentage(`${identifier}:${salt}`);
    const threshold = rule.conditions?.percentage ?? 0;
    return bucket < threshold;
  }
}
