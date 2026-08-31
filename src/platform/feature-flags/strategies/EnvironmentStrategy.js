import { TargetingStrategy } from './TargetingStrategy.js';

/**
 * Environment Strategy for environment-specific gating (e.g. development, staging, production).
 */
export class EnvironmentStrategy extends TargetingStrategy {
  canHandle(rule) {
    return rule.type === 'ENVIRONMENT';
  }

  evaluate(rule, context) {
    const currentEnv = context.environment || 'development';
    const allowedEnvs = rule.conditions?.environments || [];
    return allowedEnvs.includes(currentEnv);
  }
}
