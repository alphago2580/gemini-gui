interface TrieNode {
  children: Map<string, TrieNode>;
  isEnd: boolean;
  count: number;
}

function createNode(): TrieNode {
  return {
    children: new Map(),
    isEnd: false,
    count: 0,
  };
}

export class Trie {
  private root: TrieNode = createNode();
  private wordCount = 0;

  get size(): number {
    return this.wordCount;
  }

  get isEmpty(): boolean {
    return this.wordCount === 0;
  }

  insert(word: string): void {
    let node = this.root;
    for (const char of word) {
      if (!node.children.has(char)) {
        node.children.set(char, createNode());
      }
      node = node.children.get(char)!;
      node.count++;
    }
    if (!node.isEnd) {
      node.isEnd = true;
      this.wordCount++;
    }
  }

  search(word: string): boolean {
    const node = this.findNode(word);
    return node !== null && node.isEnd;
  }

  startsWith(prefix: string): boolean {
    return this.findNode(prefix) !== null;
  }

  remove(word: string): boolean {
    return this.removeHelper(this.root, word, 0);
  }

  getWordsWithPrefix(prefix: string): string[] {
    const node = this.findNode(prefix);
    if (!node) return [];
    const words: string[] = [];
    this.collectWords(node, prefix, words);
    return words;
  }

  getAllWords(): string[] {
    const words: string[] = [];
    this.collectWords(this.root, '', words);
    return words;
  }

  countWordsWithPrefix(prefix: string): number {
    const node = this.findNode(prefix);
    return node?.count ?? 0;
  }

  longestCommonPrefix(): string {
    let node = this.root;
    let prefix = '';
    while (node.children.size === 1 && !node.isEnd) {
      const [char, child] = [...node.children.entries()][0];
      prefix += char;
      node = child;
    }
    return prefix;
  }

  clear(): void {
    this.root = createNode();
    this.wordCount = 0;
  }

  private findNode(prefix: string): TrieNode | null {
    let node = this.root;
    for (const char of prefix) {
      if (!node.children.has(char)) return null;
      node = node.children.get(char)!;
    }
    return node;
  }

  private collectWords(node: TrieNode, prefix: string, words: string[]): void {
    if (node.isEnd) {
      words.push(prefix);
    }
    for (const [char, child] of node.children) {
      this.collectWords(child, prefix + char, words);
    }
  }

  private removeHelper(node: TrieNode, word: string, depth: number): boolean {
    if (depth === word.length) {
      if (!node.isEnd) return false;
      node.isEnd = false;
      this.wordCount--;
      return node.children.size === 0;
    }

    const char = word[depth];
    const child = node.children.get(char);
    if (!child) return false;

    child.count--;
    const shouldDeleteChild = this.removeHelper(child, word, depth + 1);

    if (shouldDeleteChild) {
      node.children.delete(char);
      return !node.isEnd && node.children.size === 0;
    }

    return false;
  }
}

export function createTrie(words?: string[]): Trie {
  const trie = new Trie();
  if (words) {
    for (const word of words) {
      trie.insert(word);
    }
  }
  return trie;
}

export function autoComplete(trie: Trie, prefix: string, limit: number = 10): string[] {
  return trie.getWordsWithPrefix(prefix).slice(0, limit);
}

export function spellCheck(trie: Trie, word: string): { isCorrect: boolean; suggestions: string[] } {
  if (trie.search(word)) {
    return { isCorrect: true, suggestions: [] };
  }

  const suggestions: string[] = [];

  // Check single character deletions
  for (let i = 0; i < word.length; i++) {
    const candidate = word.slice(0, i) + word.slice(i + 1);
    if (trie.search(candidate) && !suggestions.includes(candidate)) {
      suggestions.push(candidate);
    }
  }

  // Check single character replacements
  for (let i = 0; i < word.length; i++) {
    for (let c = 97; c <= 122; c++) {
      const char = String.fromCharCode(c);
      if (char !== word[i]) {
        const candidate = word.slice(0, i) + char + word.slice(i + 1);
        if (trie.search(candidate) && !suggestions.includes(candidate)) {
          suggestions.push(candidate);
        }
      }
    }
  }

  // Check single character insertions
  for (let i = 0; i <= word.length; i++) {
    for (let c = 97; c <= 122; c++) {
      const char = String.fromCharCode(c);
      const candidate = word.slice(0, i) + char + word.slice(i);
      if (trie.search(candidate) && !suggestions.includes(candidate)) {
        suggestions.push(candidate);
      }
    }
  }

  return { isCorrect: false, suggestions };
}
