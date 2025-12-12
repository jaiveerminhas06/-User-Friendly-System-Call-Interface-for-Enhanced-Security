/**
 * String Formatting Utilities
 * 
 * A collection of standalone utility functions for string manipulation,
 * formatting, and transformation operations.
 * 
 * Features:
 * - Case conversions (camelCase, snake_case, kebab-case, Title Case)
 * - String truncation with ellipsis
 * - Slug generation for URLs
 * - String sanitization and validation
 * - Word counting and text statistics
 * - Template string interpolation
 */

/**
 * Converts a string to camelCase
 * @param str - String to convert
 * @returns camelCase version of the string
 */
export function toCamelCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase());
}

/**
 * Converts a string to snake_case
 * @param str - String to convert
 * @returns snake_case version of the string
 */
export function toSnakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

/**
 * Converts a string to kebab-case
 * @param str - String to convert
 * @returns kebab-case version of the string
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Converts a string to Title Case
 * @param str - String to convert
 * @returns Title Case version of the string
 */
export function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Truncates a string to a maximum length with ellipsis
 * @param str - String to truncate
 * @param maxLength - Maximum length (including ellipsis)
 * @param ellipsis - Ellipsis string (default: '...')
 * @returns Truncated string
 */
export function truncate(str: string, maxLength: number, ellipsis: string = '...'): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - ellipsis.length) + ellipsis;
}

/**
 * Generates a URL-friendly slug from a string
 * @param str - String to convert to slug
 * @returns URL-safe slug
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Capitalizes the first letter of a string
 * @param str - String to capitalize
 * @returns String with first letter capitalized
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Counts the number of words in a string
 * @param str - String to count words in
 * @returns Number of words
 */
export function wordCount(str: string): number {
  return str.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Reverses a string
 * @param str - String to reverse
 * @returns Reversed string
 */
export function reverse(str: string): string {
  return str.split('').reverse().join('');
}

/**
 * Checks if a string is a palindrome
 * @param str - String to check
 * @returns True if palindrome
 */
export function isPalindrome(str: string): boolean {
  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleaned === reverse(cleaned);
}

/**
 * Removes all whitespace from a string
 * @param str - String to process
 * @returns String without whitespace
 */
export function removeWhitespace(str: string): string {
  return str.replace(/\s+/g, '');
}

/**
 * Pads a string to a certain length with a character
 * @param str - String to pad
 * @param length - Target length
 * @param char - Character to pad with (default: ' ')
 * @param right - Pad on right side (default: false, pads left)
 * @returns Padded string
 */
export function pad(str: string, length: number, char: string = ' ', right: boolean = false): string {
  if (str.length >= length) return str;
  const padding = char.repeat(length - str.length);
  return right ? str + padding : padding + str;
}

/**
 * Extracts initials from a name
 * @param name - Full name string
 * @returns Initials (uppercase)
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase();
}

/**
 * Masks part of a string (useful for emails, phone numbers)
 * @param str - String to mask
 * @param visibleStart - Number of characters visible at start
 * @param visibleEnd - Number of characters visible at end
 * @param maskChar - Character to use for masking (default: '*')
 * @returns Masked string
 */
export function mask(str: string, visibleStart: number = 3, visibleEnd: number = 3, maskChar: string = '*'): string {
  if (str.length <= visibleStart + visibleEnd) return str;
  const start = str.slice(0, visibleStart);
  const end = str.slice(-visibleEnd);
  const middle = maskChar.repeat(str.length - visibleStart - visibleEnd);
  return start + middle + end;
}
