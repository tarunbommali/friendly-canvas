import { PercentageRolloutStrategy } from './strategies/PercentageRolloutStrategy.js';
import { AttributeMatchStrategy } from './strategies/AttributeMatchStrategy.js';
import { EnvironmentStrategy } from './strategies/EnvironmentStrategy.js';

/**
 * High-performance, deterministic Evaluation Engine for Feature Flags.
 * Implements Chain of Responsibility across pluggable Targeting Strategies.
 */
export class EvaluationEngine {
  /**
   * @param {import('./FlagRepository.js').FlagRepository} repository
   * @param {import('./strategies/TargetingStrategy.js').TargetingStrategy[]} [customStrategies]
   */
  constructor(repository, customStrategies = []) {
    this.repository = repository;
    this.strategies = [
      ...customStrategies,
      new PercentageRolloutStrategy(),
      new AttributeMatchStrategy(),
      new EnvironmentStrategy(),
    ];
  }

  /**
   * Register an additional custom targeting strategy (OCP principle)
   * @param {import('./strategies/TargetingStrategy.js').TargetingStrategy} strategy
   */
  registerStrategy(strategy) {
    this.strategies.unshift(strategy);
  }

  /**
   * Evaluate a flag key against an evaluation context.
   * @param {string} flagKey
   * @param {Object} [context]
   * @returns {{ enabled: boolean, reason: string, ruleId?: string, durationMs: number }}
   */
  evaluate(flagKey, context = {}) {
    const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();

    try {
      // 1. Check for local explicit override (highest priority)
      const override = this.repository.getOverride(flagKey);
      if (override !== undefined) {
        const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
        return {
          enabled: override,
          reason: 'LOCAL_OVERRIDE',
          durationMs: endTime - startTime,
        };
      }

      // 2. Fetch flag definition
      const flag = this.repository.getFlag(flagKey);
      if (!flag) {
        const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
        return {
          enabled: false,
          reason: 'FLAG_NOT_FOUND',
          durationMs: endTime - startTime,
        };
      }

      // 3. Master toggle check
      if (!flag.enabled) {
        const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
        return {
          enabled: false,
          reason: 'FLAG_DISABLED',
          durationMs: endTime - startTime,
        };
      }

      // 4. Evaluate rules by priority (Chain of Responsibility)
      const rules = [...(flag.rules || [])].sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));

      for (const rule of rules) {
        const handler = this.strategies.find((s) => s.canHandle(rule));
        if (handler) {
          const isMatch = handler.evaluate(rule, context);
          if (isMatch) {
            const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
            return {
              enabled: Boolean(rule.serve),
              reason: 'RULE_MATCH',
              ruleId: rule.id,
              durationMs: endTime - startTime,
            };
          }
        }
      }

      // 5. Fallback to default state
      const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
      return {
        enabled: Boolean(flag.defaultState),
        reason: 'DEFAULT_FALLBACK',
        durationMs: endTime - startTime,
      };
    } catch (err) {
      const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
      return {
        enabled: false,
        reason: 'ERROR_FALLBACK',
        durationMs: endTime - startTime,
        error: err.message,
      };
    }
  }

  /**
   * Convenience boolean helper
   * @param {string} flagKey
   * @param {Object} [context]
   * @returns {boolean}
   */
  isEnabled(flagKey, context = {}) {
    return this.evaluate(flagKey, context).enabled;
  }
}
