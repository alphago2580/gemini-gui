export type CompareFn<T> = (a: T, b: T) => number;

export function bubbleSort<T>(arr: T[], compare: CompareFn<T> = defaultCompare): T[] {
  const result = [...arr];
  const n = result.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      if (compare(result[j], result[j + 1]) > 0) {
        [result[j], result[j + 1]] = [result[j + 1], result[j]];
        swapped = true;
      }
    }
    if (!swapped) break;
  }
  return result;
}

export function selectionSort<T>(arr: T[], compare: CompareFn<T> = defaultCompare): T[] {
  const result = [...arr];
  const n = result.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      if (compare(result[j], result[minIdx]) < 0) {
        minIdx = j;
      }
    }
    if (minIdx !== i) {
      [result[i], result[minIdx]] = [result[minIdx], result[i]];
    }
  }
  return result;
}

export function insertionSort<T>(arr: T[], compare: CompareFn<T> = defaultCompare): T[] {
  const result = [...arr];
  const n = result.length;
  for (let i = 1; i < n; i++) {
    const current = result[i];
    let j = i - 1;
    while (j >= 0 && compare(result[j], current) > 0) {
      result[j + 1] = result[j];
      j--;
    }
    result[j + 1] = current;
  }
  return result;
}

export function mergeSort<T>(arr: T[], compare: CompareFn<T> = defaultCompare): T[] {
  if (arr.length <= 1) return [...arr];

  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid), compare);
  const right = mergeSort(arr.slice(mid), compare);

  return merge(left, right, compare);
}

function merge<T>(left: T[], right: T[], compare: CompareFn<T>): T[] {
  const result: T[] = [];
  let i = 0;
  let j = 0;

  while (i < left.length && j < right.length) {
    if (compare(left[i], right[j]) <= 0) {
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }

  while (i < left.length) result.push(left[i++]);
  while (j < right.length) result.push(right[j++]);

  return result;
}

export function quickSort<T>(arr: T[], compare: CompareFn<T> = defaultCompare): T[] {
  if (arr.length <= 1) return [...arr];

  const result = [...arr];
  quickSortInPlace(result, 0, result.length - 1, compare);
  return result;
}

function quickSortInPlace<T>(arr: T[], low: number, high: number, compare: CompareFn<T>): void {
  if (low < high) {
    const pivotIdx = partition(arr, low, high, compare);
    quickSortInPlace(arr, low, pivotIdx - 1, compare);
    quickSortInPlace(arr, pivotIdx + 1, high, compare);
  }
}

function partition<T>(arr: T[], low: number, high: number, compare: CompareFn<T>): number {
  const pivot = arr[high];
  let i = low - 1;

  for (let j = low; j < high; j++) {
    if (compare(arr[j], pivot) <= 0) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  return i + 1;
}

export function heapSort<T>(arr: T[], compare: CompareFn<T> = defaultCompare): T[] {
  const result = [...arr];
  const n = result.length;

  // Build max heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(result, n, i, compare);
  }

  // Extract elements from heap
  for (let i = n - 1; i > 0; i--) {
    [result[0], result[i]] = [result[i], result[0]];
    heapify(result, i, 0, compare);
  }

  return result;
}

function heapify<T>(arr: T[], size: number, root: number, compare: CompareFn<T>): void {
  let largest = root;
  const left = 2 * root + 1;
  const right = 2 * root + 2;

  if (left < size && compare(arr[left], arr[largest]) > 0) {
    largest = left;
  }

  if (right < size && compare(arr[right], arr[largest]) > 0) {
    largest = right;
  }

  if (largest !== root) {
    [arr[root], arr[largest]] = [arr[largest], arr[root]];
    heapify(arr, size, largest, compare);
  }
}

export function isSorted<T>(arr: T[], compare: CompareFn<T> = defaultCompare): boolean {
  for (let i = 1; i < arr.length; i++) {
    if (compare(arr[i - 1], arr[i]) > 0) return false;
  }
  return true;
}

export function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function sortByKey<T>(arr: T[], key: keyof T, ascending: boolean = true): T[] {
  return [...arr].sort((a, b) => {
    const valA = a[key];
    const valB = b[key];
    const cmp = valA < valB ? -1 : valA > valB ? 1 : 0;
    return ascending ? cmp : -cmp;
  });
}

export function stableSort<T>(arr: T[], compare: CompareFn<T> = defaultCompare): T[] {
  const indexed = arr.map((val, idx) => ({ val, idx }));
  indexed.sort((a, b) => {
    const cmp = compare(a.val, b.val);
    return cmp !== 0 ? cmp : a.idx - b.idx;
  });
  return indexed.map(item => item.val);
}

function defaultCompare<T>(a: T, b: T): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}
