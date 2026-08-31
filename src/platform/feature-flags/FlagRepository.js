/**
 * @interface IFlagRepository
 * In-memory / persistent repository for feature flag definitions.
 */
export class FlagRepository {
  /**
   * @param {Record<string, any>} initialFlags
   */
  constructor(initialFlags = {}) {
    /** @type {Map<string, any>} */
    this.flags = new Map(Object.entries(initialFlags));
    /** @type {Map<string, boolean>} */
    this.overrides = new Map();
  }

  /**
   * @param {string} key
   * @returns {any | undefined}
   */
  getFlag(key) {
    return this.flags.get(key);
  }

  /**
   * @returns {Map<string, any>}
   */
  getAllFlags() {
    return new Map(this.flags);
  }

  /**
   * @param {string} key
   * @param {any} flagDefinition
   */
  setFlag(key, flagDefinition) {
    this.flags.set(key, flagDefinition);
  }

  /**
   * Set manual override for local testing / development
   * @param {string} key
   * @param {boolean | null} value
   */
  setOverride(key, value) {
    if (value === null || value === undefined) {
      this.overrides.delete(key);
    } else {
      this.overrides.set(key, Boolean(value));
    }
  }

  /**
   * @param {string} key
   * @returns {boolean | undefined}
   */
  getOverride(key) {
    return this.overrides.get(key);
  }

  /**
   * Clear all manual overrides
   */
  clearOverrides() {
    this.overrides.clear();
  }
}
