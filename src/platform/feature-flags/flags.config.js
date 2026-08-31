/**
 * Default Feature Flag Definitions Catalog for friendly-canvas
 */
export const DEFAULT_FLAGS = {
  'search-fuzzy-ranking': {
    key: 'search-fuzzy-ranking',
    name: 'Fuzzy Search Ranking',
    description: 'Enables Damerau-Levenshtein fuzzy matching in Search-as-you-type',
    enabled: true,
    defaultState: true,
    rules: [
      {
        id: 'rule-fuzzy-env',
        type: 'ENVIRONMENT',
        priority: 1,
        conditions: { environments: ['development', 'staging', 'production'] },
        serve: true,
      },
    ],
  },
  'layout-caching-v2': {
    key: 'layout-caching-v2',
    name: 'Layout Engine Memoization & Cache DAG',
    description: 'Enables high-performance LRU caching with dependency graph invalidation for slide layout computation',
    enabled: true,
    defaultState: true,
    rules: [],
  },
  'canvas-hud-observability': {
    key: 'canvas-hud-observability',
    name: 'Developer Observability HUD',
    description: 'Renders in-canvas real-time telemetry HUD overlay for frame rates and memory',
    enabled: true,
    defaultState: true,
    rules: [
      {
        id: 'rule-hud-dev',
        type: 'ENVIRONMENT',
        priority: 1,
        conditions: { environments: ['development', 'staging'] },
        serve: true,
      },
    ],
  },
  'incident-chaos-lab': {
    key: 'incident-chaos-lab',
    name: 'Incident Response & Chaos Lab Panel',
    description: 'Surfaces interactive Chaos Engineering triggers and incident postmortem tools',
    enabled: true,
    defaultState: true,
    rules: [],
  },
  'experimental-safe-area-overlay': {
    key: 'experimental-safe-area-overlay',
    name: 'Instagram 4:5 Safe Area Visual Guides',
    description: 'Displays safe area visual bounding boxes for Instagram feed presentation',
    enabled: true,
    defaultState: true,
    rules: [
      {
        id: 'rule-percentage-rollout',
        type: 'PERCENTAGE',
        priority: 2,
        conditions: { percentage: 100 },
        serve: true,
      },
    ],
  },
};
