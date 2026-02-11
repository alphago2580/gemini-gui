export interface ListNode<T> {
  value: T;
  next: ListNode<T> | null;
}

export class LinkedList<T> {
  head: ListNode<T> | null = null;
  private _size = 0;

  get size(): number {
    return this._size;
  }

  get isEmpty(): boolean {
    return this._size === 0;
  }

  static from<T>(values: T[]): LinkedList<T> {
    const list = new LinkedList<T>();
    for (const value of values) {
      list.append(value);
    }
    return list;
  }

  prepend(value: T): void {
    this.head = { value, next: this.head };
    this._size++;
  }

  append(value: T): void {
    const node: ListNode<T> = { value, next: null };
    if (!this.head) {
      this.head = node;
    } else {
      let current = this.head;
      while (current.next) {
        current = current.next;
      }
      current.next = node;
    }
    this._size++;
  }

  insertAt(index: number, value: T): boolean {
    if (index < 0 || index > this._size) return false;
    if (index === 0) {
      this.prepend(value);
      return true;
    }
    let current = this.head;
    for (let i = 0; i < index - 1; i++) {
      current = current!.next;
    }
    current!.next = { value, next: current!.next };
    this._size++;
    return true;
  }

  removeFirst(): T | undefined {
    if (!this.head) return undefined;
    const value = this.head.value;
    this.head = this.head.next;
    this._size--;
    return value;
  }

  removeLast(): T | undefined {
    if (!this.head) return undefined;
    if (!this.head.next) {
      const value = this.head.value;
      this.head = null;
      this._size--;
      return value;
    }
    let current = this.head;
    while (current.next!.next) {
      current = current.next!;
    }
    const value = current.next!.value;
    current.next = null;
    this._size--;
    return value;
  }

  removeAt(index: number): T | undefined {
    if (index < 0 || index >= this._size) return undefined;
    if (index === 0) return this.removeFirst();
    let current = this.head;
    for (let i = 0; i < index - 1; i++) {
      current = current!.next;
    }
    const value = current!.next!.value;
    current!.next = current!.next!.next;
    this._size--;
    return value;
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this._size) return undefined;
    let current = this.head;
    for (let i = 0; i < index; i++) {
      current = current!.next;
    }
    return current!.value;
  }

  indexOf(value: T): number {
    let current = this.head;
    let index = 0;
    while (current) {
      if (current.value === value) return index;
      current = current.next;
      index++;
    }
    return -1;
  }

  contains(value: T): boolean {
    return this.indexOf(value) !== -1;
  }

  find(predicate: (value: T) => boolean): T | undefined {
    let current = this.head;
    while (current) {
      if (predicate(current.value)) return current.value;
      current = current.next;
    }
    return undefined;
  }

  toArray(): T[] {
    const result: T[] = [];
    let current = this.head;
    while (current) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }

  reverse(): void {
    let prev: ListNode<T> | null = null;
    let current = this.head;
    while (current) {
      const next = current.next;
      current.next = prev;
      prev = current;
      current = next;
    }
    this.head = prev;
  }

  map<U>(fn: (value: T, index: number) => U): LinkedList<U> {
    const result = new LinkedList<U>();
    let current = this.head;
    let index = 0;
    while (current) {
      result.append(fn(current.value, index));
      current = current.next;
      index++;
    }
    return result;
  }

  filter(predicate: (value: T, index: number) => boolean): LinkedList<T> {
    const result = new LinkedList<T>();
    let current = this.head;
    let index = 0;
    while (current) {
      if (predicate(current.value, index)) {
        result.append(current.value);
      }
      current = current.next;
      index++;
    }
    return result;
  }

  forEach(fn: (value: T, index: number) => void): void {
    let current = this.head;
    let index = 0;
    while (current) {
      fn(current.value, index);
      current = current.next;
      index++;
    }
  }

  clear(): void {
    this.head = null;
    this._size = 0;
  }

  clone(): LinkedList<T> {
    return LinkedList.from(this.toArray());
  }
}
