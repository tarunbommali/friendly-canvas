/**
 * Doubly-Linked List Node for O(1) LRU Cache eviction
 */
class LRUNode {
  constructor(key, value) {
    this.key = key;
    this.value = value;
    this.prev = null;
    this.next = null;
    this.lastAccessed = Date.now();
  }
}

/**
 * High-performance O(1) LRU (Least Recently Used) Cache Store
 */
export class LRUCacheStore {
  /**
   * @param {number} capacity - Maximum entries before eviction
   */
  constructor(capacity = 100) {
    if (capacity <= 0) throw new Error('LRUCache capacity must be > 0');
    this.capacity = capacity;
    this.size = 0;
    /** @type {Map<string, LRUNode>} */
    this.map = new Map();

    // Sentinel dummy head and tail
    this.head = new LRUNode(null, null);
    this.tail = new LRUNode(null, null);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  /**
   * @param {LRUNode} node
   */
  _remove(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }

  /**
   * @param {LRUNode} node
   */
  _insertAtHead(node) {
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next.prev = node;
    this.head.next = node;
  }

  /**
   * Get value and move node to head (MRU)
   * @param {string} key
   * @returns {any | undefined}
   */
  get(key) {
    const node = this.map.get(key);
    if (!node) return undefined;

    node.lastAccessed = Date.now();
    this._remove(node);
    this._insertAtHead(node);
    return node.value;
  }

  /**
   * Put value into cache, evicting LRU item if capacity is exceeded
   * @param {string} key
   * @param {any} value
   */
  set(key, value) {
    if (this.map.has(key)) {
      const existingNode = this.map.get(key);
      existingNode.value = value;
      existingNode.lastAccessed = Date.now();
      this._remove(existingNode);
      this._insertAtHead(existingNode);
      return;
    }

    if (this.size >= this.capacity) {
      // Evict least recently used (node before tail)
      const lruNode = this.tail.prev;
      if (lruNode && lruNode !== this.head) {
        this._remove(lruNode);
        this.map.delete(lruNode.key);
        this.size--;
      }
    }

    const newNode = new LRUNode(key, value);
    this._insertAtHead(newNode);
    this.map.set(key, newNode);
    this.size++;
  }

  /**
   * @param {string} key
   * @returns {boolean}
   */
  has(key) {
    return this.map.has(key);
  }

  /**
   * @param {string} key
   * @returns {boolean}
   */
  delete(key) {
    const node = this.map.get(key);
    if (!node) return false;

    this._remove(node);
    this.map.delete(key);
    this.size--;
    return true;
  }

  /**
   * Clears entire store
   */
  clear() {
    this.map.clear();
    this.size = 0;
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  /**
   * Get current keys in MRU order
   * @returns {string[]}
   */
  keys() {
    const keys = [];
    let curr = this.head.next;
    while (curr && curr !== this.tail) {
      keys.push(curr.key);
      curr = curr.next;
    }
    return keys;
  }
}
