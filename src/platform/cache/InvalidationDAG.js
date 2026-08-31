/**
 * Directed Acyclic Graph (DAG) for Dependency-Aware Cache Invalidation.
 * When a root entity changes (e.g. `slide:123`), all downstream dependent keys
 * (e.g. `layout:123`, `thumb:123`, `export:123`) are cascaded and invalidated.
 */
export class InvalidationDAG {
  constructor() {
    /** @type {Map<string, Set<string>>} Parent -> Set of dependent Children */
    this.forwardGraph = new Map();
    /** @type {Map<string, Set<string>>} Child -> Set of parent Keys */
    this.reverseGraph = new Map();
  }

  /**
   * Register a dependency: when `parentKey` is invalidated, `dependentKey` will also be invalidated.
   * @param {string} parentKey
   * @param {string} dependentKey
   */
  addDependency(parentKey, dependentKey) {
    if (parentKey === dependentKey) return;

    if (!this.forwardGraph.has(parentKey)) {
      this.forwardGraph.set(parentKey, new Set());
    }
    this.forwardGraph.get(parentKey).add(dependentKey);

    if (!this.reverseGraph.has(dependentKey)) {
      this.reverseGraph.set(dependentKey, new Set());
    }
    this.reverseGraph.get(dependentKey).add(parentKey);
  }

  /**
   * Traverse graph using BFS/DFS to find all cascading dependents of `rootKey`.
   * @param {string} rootKey
   * @returns {string[]} Ordered list of keys to invalidate (including rootKey)
   */
  getDependents(rootKey) {
    const visited = new Set([rootKey]);
    const queue = [rootKey];
    const results = [rootKey];

    while (queue.length > 0) {
      const current = queue.shift();
      const dependents = this.forwardGraph.get(current);

      if (dependents) {
        for (const dep of dependents) {
          if (!visited.has(dep)) {
            visited.add(dep);
            queue.push(dep);
            results.push(dep);
          }
        }
      }
    }

    return results;
  }

  /**
   * Remove a node from graph when explicitly purged
   * @param {string} key
   */
  removeNode(key) {
    const dependents = this.forwardGraph.get(key);
    if (dependents) {
      for (const dep of dependents) {
        this.reverseGraph.get(dep)?.delete(key);
      }
      this.forwardGraph.delete(key);
    }

    const parents = this.reverseGraph.get(key);
    if (parents) {
      for (const parent of parents) {
        this.forwardGraph.get(parent)?.delete(key);
      }
      this.reverseGraph.delete(key);
    }
  }

  clear() {
    this.forwardGraph.clear();
    this.reverseGraph.clear();
  }
}
