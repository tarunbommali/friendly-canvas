/**
 * Prefix Trie Node
 */
class TrieNode {
  constructor() {
    /** @type {Map<string, TrieNode>} */
    this.children = new Map();
    /** @type {Set<string>} Document IDs associated with this exact word or prefix */
    this.docIds = new Set();
    this.isEndOfWord = false;
  }
}

/**
 * High-performance Prefix Trie for Sub-Millisecond Autocomplete & Prefix Matches
 */
export class PrefixTrie {
  constructor() {
    this.root = new TrieNode();
  }

  /**
   * Insert a word and link it to a document ID
   * @param {string} word
   * @param {string} docId
   */
  insert(word, docId) {
    if (!word) return;
    let curr = this.root;
    curr.docIds.add(docId);

    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      if (!curr.children.has(char)) {
        curr.children.set(char, new TrieNode());
      }
      curr = curr.children.get(char);
      curr.docIds.add(docId);
    }
    curr.isEndOfWord = true;
  }

  /**
   * Search all document IDs that have tokens matching prefix
   * @param {string} prefix
   * @returns {Set<string>}
   */
  searchPrefix(prefix) {
    if (!prefix) return new Set();
    let curr = this.root;

    for (let i = 0; i < prefix.length; i++) {
      const char = prefix[i];
      if (!curr.children.has(char)) {
        return new Set(); // No matches for this prefix
      }
      curr = curr.children.get(char);
    }

    return new Set(curr.docIds);
  }

  clear() {
    this.root = new TrieNode();
  }
}
