import { TargetingStrategy } from './TargetingStrategy.js';

/**
 * Attribute Match Strategy for evaluating user and tenant attributes
 * with operators: EQUALS, NOT_EQUALS, IN, NOT_IN, GREATER_THAN, LESS_THAN, REGEX.
 */
export class AttributeMatchStrategy extends TargetingStrategy {
  canHandle(rule) {
    return rule.type === 'ATTRIBUTE';
  }

  evaluate(rule, context) {
    const { attribute, operator, value } = rule.conditions || {};
    if (!attribute || !operator) return false;

    // Resolve attribute from context or context.attributes
    const actualValue = context.attributes?.[attribute] ?? context[attribute];
    if (actualValue === undefined) return false;

    switch (operator) {
      case 'EQUALS':
        return actualValue === value;
      case 'NOT_EQUALS':
        return actualValue !== value;
      case 'IN':
        return Array.isArray(value) && value.includes(actualValue);
      case 'NOT_IN':
        return Array.isArray(value) && !value.includes(actualValue);
      case 'GREATER_THAN':
        return Number(actualValue) > Number(value);
      case 'LESS_THAN':
        return Number(actualValue) < Number(value);
      case 'REGEX':
        try {
          const regex = new RegExp(value);
          return regex.test(String(actualValue));
        } catch {
          return false;
        }
      default:
        return false;
    }
  }
}
