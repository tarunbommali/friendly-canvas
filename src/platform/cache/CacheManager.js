import { LRUCacheStore } from './stores/LRUCacheStore.js';
import { TTLCacheStore } from './stores/TTLCacheStore.js';
import { InvalidationDAG } from './InvalidationDAG.js';

/**
 * Enterprise Frontend Cache Manager.
 * Orchestrates multi-namespace caching (LRU, TTL), statistics, and DAG dependency invalidations.
 */
export class CacheManager {
  /**
   * @param {Object} [config]
   * @param {number} [config.layoutCapacity=150]
   * @param {number} [config.thumbnailCapacity=80]
   * @param {number} [config.dataTTLMs=600000]
   */
  constructor(config = {}) {
    this.layoutCache = new LRUCacheStore(config.layoutCapacity || 150);
    this.thumbnailCache = new LRUCacheStore(config.thumbnailCapacity || 80);
    this.searchCache = new LRUCacheStore(config.searchCapacity || 100);
    this.dataCache = new TTLCacheStore(config.dataTTLMs || 600000);

    this.dag = new InvalidationDAG();

    this.stats = {
      hits: 0,
      misses: 0,
      invalidations: 0,
    };
  }

  /**
   * @param {'layout' | 'thumbnail' | 'search' | 'data'} namespace
   * @returns {LRUCacheStore | TTLCacheStore}
   */
  getStore(namespace) {
    switch (namespace) {
      case 'layout':
        return this.layoutCache;
      case 'thumbnail':
        return this.thumbnailCache;
      case 'search':
        return this.searchCache;
      case 'data':
        return this.dataCache;
      default:
        throw new Error(`Unknown cache namespace: ${namespace}`);
    }
  }

  /**
   * Retrieve an item from a namespace
   * @param {'layout' | 'thumbnail' | 'search' | 'data'} namespace
   * @param {string} key
   * @returns {any | undefined}
   */
  get(namespace, key) {
    const store = this.getStore(namespace);
    const value = store.get(key);
    if (value !== undefined) {
      this.stats.hits++;
    } else {
      this.stats.misses++;
    }
    return value;
  }

  /**
   * Store an item in a namespace with optional dependency registration
   * @param {'layout' | 'thumbnail' | 'search' | 'data'} namespace
   * @param {string} key
   * @param {any} value
   * @param {Object} [options]
   * @param {string[]} [options.dependencies]
   * @param {number} [options.ttlMs]
   */
  set(namespace, key, value, options = {}) {
    const store = this.getStore(namespace);
    store.set(key, value, options.ttlMs);

    if (options.dependencies && Array.isArray(options.dependencies)) {
      for (const parentKey of options.dependencies) {
        this.dag.addDependency(parentKey, `${namespace}:${key}`);
      }
    }
  }

  /**
   * Invalidate a key and all its cascading downstream dependents across all namespaces
   * @param {string} rootKey
   * @returns {string[]} List of keys invalidated
   */
  invalidateCascade(rootKey) {
    const keysToInvalidate = this.dag.getDependents(rootKey);

    for (const namespacedKey of keysToInvalidate) {
      if (namespacedKey.includes(':')) {
        const [ns, key] = namespacedKey.split(':');
        try {
          const store = this.getStore(ns);
          store.delete(key);
        } catch {
          // Ignore invalid namespace
        }
      } else {
        // Purge matching keys across namespaces
        this.layoutCache.delete(namespacedKey);
        this.thumbnailCache.delete(namespacedKey);
        this.searchCache.delete(namespacedKey);
        this.dataCache.delete(namespacedKey);
      }
      this.stats.invalidations++;
    }

    return keysToInvalidate;
  }

  /**
   * Cache Performance Metrics & Hit Rate
   * @returns {{ hits: number, misses: number, invalidations: number, hitRate: number }}
   */
  getMetrics() {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total === 0 ? 0 : Number((this.stats.hits / total).toFixed(4));
    return {
      ...this.stats,
      hitRate,
    };
  }

  /**
   * Reset all caches and DAG
   */
  clearAll() {
    this.layoutCache.clear();
    this.thumbnailCache.clear();
    this.searchCache.clear();
    this.dataCache.clear();
    this.dag.clear();
  }
}

// Global Singleton Cache Instance
export const globalCacheManager = new CacheManager();
