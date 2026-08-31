/**
 * @interface ITargetingStrategy
 * Base strategy contract for evaluating feature flag rules.
 */
export class TargetingStrategy {
  /**
   * @param {Object} rule
   * @returns {boolean}
   */
  canHandle(rule) {
    throw new Error('Method canHandle() must be implemented');
  }

  /**
   * @param {Object} rule
   * @param {Object} context
   * @returns {boolean}
   */
  evaluate(rule, context) {
    throw new Error('Method evaluate() must be implemented');
  }
}
