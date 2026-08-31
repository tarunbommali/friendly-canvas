import test from 'node:test';
import assert from 'node:assert/strict';
import { FlagRepository } from '../../src/platform/feature-flags/FlagRepository.js';
import { EvaluationEngine } from '../../src/platform/feature-flags/EvaluationEngine.js';
import { PercentageRolloutStrategy } from '../../src/platform/feature-flags/strategies/PercentageRolloutStrategy.js';

test('Feature Flags - Deterministic percentage hashing is consistent', () => {
  const hash1 = PercentageRolloutStrategy.hashToPercentage('user-123:salt-abc');
  const hash2 = PercentageRolloutStrategy.hashToPercentage('user-123:salt-abc');
  assert.equal(hash1, hash2, 'Hash should be deterministic for identical inputs');
  assert.ok(hash1 >= 0 && hash1 < 100, 'Hash must be between 0 and 99');
});

test('Feature Flags - Evaluates rules by priority and context', () => {
  const repo = new FlagRepository({
    'dark-mode-v2': {
      key: 'dark-mode-v2',
      enabled: true,
      defaultState: false,
      rules: [
        {
          id: 'rule-beta-users',
          type: 'ATTRIBUTE',
          priority: 1,
          conditions: { attribute: 'isBeta', operator: 'EQUALS', value: true },
          serve: true,
        },
        {
          id: 'rule-env',
          type: 'ENVIRONMENT',
          priority: 2,
          conditions: { environments: ['staging'] },
          serve: true,
        },
      ],
    },
  });

  const engine = new EvaluationEngine(repo);

  // Beta user in production => true
  const res1 = engine.evaluate('dark-mode-v2', { userId: 'u1', environment: 'production', attributes: { isBeta: true } });
  assert.equal(res1.enabled, true);
  assert.equal(res1.reason, 'RULE_MATCH');
  assert.equal(res1.ruleId, 'rule-beta-users');

  // Non-beta user in staging => true
  const res2 = engine.evaluate('dark-mode-v2', { userId: 'u2', environment: 'staging', attributes: { isBeta: false } });
  assert.equal(res2.enabled, true);
  assert.equal(res2.ruleId, 'rule-env');

  // Non-beta user in production => false (default fallback)
  const res3 = engine.evaluate('dark-mode-v2', { userId: 'u3', environment: 'production', attributes: { isBeta: false } });
  assert.equal(res3.enabled, false);
  assert.equal(res3.reason, 'DEFAULT_FALLBACK');
});

test('Feature Flags - Local override takes precedence over rules', () => {
  const repo = new FlagRepository({
    'test-flag': {
      key: 'test-flag',
      enabled: false,
      defaultState: false,
      rules: [],
    },
  });

  const engine = new EvaluationEngine(repo);
  assert.equal(engine.isEnabled('test-flag'), false);

  repo.setOverride('test-flag', true);
  assert.equal(engine.isEnabled('test-flag'), true);

  repo.setOverride('test-flag', null);
  assert.equal(engine.isEnabled('test-flag'), false);
});
