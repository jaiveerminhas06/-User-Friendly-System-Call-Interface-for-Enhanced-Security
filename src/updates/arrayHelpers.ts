/**
 * Array Helper Utilities
 * 
 * A collection of standalone utility functions for advanced array manipulation,
 * filtering, and transformation operations.
 * 
 * Features:
 * - Chunk arrays into smaller groups
 * - Remove duplicates with custom key selectors
 * - Shuffle arrays randomly
 * - Find intersections and differences
 * - Flatten nested arrays
 * - Group items by key
 */

/**
 * Splits an array into chunks of specified size
 * @param array - Array to chunk
 * @param size - Size of each chunk
 * @returns Array of chunks
 */
export function chunk<T>(array: T[], size: number): T[][] {
  if (size <= 0) return [];
  
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Removes duplicate items from an array
 * @param array - Array to deduplicate
 * @param keyFn - Optional function to extract comparison key
 * @returns Array with duplicates removed
 */
export function unique<T>(array: T[], keyFn?: (item: T) => any): T[] {
  if (!keyFn) {
    return Array.from(new Set(array));
  }

  const seen = new Set();
  return array.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/**
 * Randomly shuffles an array using Fisher-Yates algorithm
 * @param array - Array to shuffle
 * @returns New shuffled array (does not modify original)
 */
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Groups array items by a key selector function
 * @param array - Array to group
 * @param keyFn - Function to extract grouping key
 * @returns Object with grouped items
 */
export function groupBy<T>(array: T[], keyFn: (item: T) => string | number): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const key = String(keyFn(item));
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Finds the intersection of two arrays
 * @param array1 - First array
 * @param array2 - Second array
 * @returns Array of common elements
 */
export function intersection<T>(array1: T[], array2: T[]): T[] {
  const set2 = new Set(array2);
  return array1.filter(item => set2.has(item));
}

/**
 * Finds the difference between two arrays (items in first but not second)
 * @param array1 - First array
 * @param array2 - Second array
 * @returns Array of elements only in first array
 */
export function difference<T>(array1: T[], array2: T[]): T[] {
  const set2 = new Set(array2);
  return array1.filter(item => !set2.has(item));
}

/**
 * Flattens a nested array to specified depth
 * @param array - Nested array to flatten
 * @param depth - Depth to flatten (default: 1)
 * @returns Flattened array
 */
export function flatten<T>(array: any[], depth: number = 1): T[] {
  if (depth === 0) return array;
  
  return array.reduce((flat, item) => {
    if (Array.isArray(item)) {
      return flat.concat(flatten(item, depth - 1));
    }
    return flat.concat(item);
  }, []);
}

/**
 * Picks random items from an array
 * @param array - Array to sample from
 * @param count - Number of items to pick
 * @returns Array of random items
 */
export function sample<T>(array: T[], count: number = 1): T[] {
  if (count >= array.length) return shuffle(array);
  
  const shuffled = shuffle(array);
  return shuffled.slice(0, count);
}

/**
 * Partitions array into two arrays based on predicate
 * @param array - Array to partition
 * @param predicate - Function to test each element
 * @returns Tuple of [matching, non-matching] arrays
 */
export function partition<T>(array: T[], predicate: (item: T) => boolean): [T[], T[]] {
  const matching: T[] = [];
  const nonMatching: T[] = [];
  
  array.forEach(item => {
    if (predicate(item)) {
      matching.push(item);
    } else {
      nonMatching.push(item);
    }
  });
  
  return [matching, nonMatching];
}

/**
 * Calculates the sum of array elements
 * @param array - Array of numbers
 * @returns Sum of all elements
 */
export function sum(array: number[]): number {
  return array.reduce((total, num) => total + num, 0);
}

/**
 * Calculates the average of array elements
 * @param array - Array of numbers
 * @returns Average value, or 0 if empty
 */
export function average(array: number[]): number {
  if (array.length === 0) return 0;
  return sum(array) / array.length;
}
