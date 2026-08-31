/**
 * Time-To-Live (TTL) Cache Store with lazy expiration and manual sweep
 */
export class TTLCacheStore {
  /**
   * @param {number} defaultTTLMs - Default expiration in ms (e.g. 5 minutes)
   */
  constructor(defaultTTLMs = 300000) {
    this.defaultTTLMs = defaultTTLMs;
    /** @type {Map<string, { value: any, expiresAt: number, createdAt: number }>} */
    this.store = new Map();
  }

  /**
   * @param {string} key
   * @returns {any | undefined}
   */
  get(key) {
    const entry = this.store.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }

    return entry.value;
  }

  /**
   * @param {string} key
   * @param {any} value
   * @param {number} [ttlMs]
   */
  set(key, value, ttlMs) {
    const duration = ttlMs !== undefined ? ttlMs : this.defaultTTLMs;
    const now = Date.now();
    this.store.set(key, {
      value,
      expiresAt: now + duration,
      createdAt: now,
    });
  }

  /**
   * @param {string} key
   * @returns {boolean}
   */
  has(key) {
    return this.get(key) !== undefined;
  }

  /**
   * @param {string} key
   * @returns {boolean}
   */
  delete(key) {
    return this.store.delete(key);
  }

  /**
   * Remove all expired items in one pass
   * @returns {number} count of purged entries
   */
  sweep() {
    const now = Date.now();
    let purged = 0;
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
        purged++;
      }
    }
    return purged;
  }

  clear() {
    this.store.clear();
  }

  get size() {
    return this.store.size;
  }
}
