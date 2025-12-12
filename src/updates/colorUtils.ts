/**
 * Color Utility Functions
 * 
 * A collection of standalone utility functions for color manipulation,
 * conversion, and validation. Supports RGB, HEX, and HSL color formats.
 * 
 * Features:
 * - Convert between HEX, RGB, and HSL color formats
 * - Generate random colors
 * - Validate color format strings
 * - Calculate color brightness and contrast
 * - Lighten/darken colors by percentage
 */

/**
 * Converts a HEX color string to RGB object
 * @param hex - HEX color string (e.g., "#FF5733" or "FF5733")
 * @returns RGB object with r, g, b values (0-255)
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleanHex = hex.replace('#', '');
  
  if (!/^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
    return null;
  }

  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  return { r, g, b };
}

/**
 * Converts RGB values to HEX color string
 * @param r - Red value (0-255)
 * @param g - Green value (0-255)
 * @param b - Blue value (0-255)
 * @returns HEX color string with # prefix
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const clamped = Math.max(0, Math.min(255, Math.round(n)));
    return clamped.toString(16).padStart(2, '0');
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Generates a random HEX color
 * @returns Random HEX color string
 */
export function randomColor(): string {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return rgbToHex(r, g, b);
}

/**
 * Validates if a string is a valid HEX color
 * @param hex - String to validate
 * @returns True if valid HEX color format
 */
export function isValidHex(hex: string): boolean {
  const cleanHex = hex.replace('#', '');
  return /^[0-9A-Fa-f]{6}$/.test(cleanHex);
}

/**
 * Calculates the brightness of a color (0-255)
 * Uses the perceived brightness formula
 * @param hex - HEX color string
 * @returns Brightness value (0-255), or null if invalid
 */
export function getBrightness(hex: string): number | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;

  // Perceived brightness formula
  return Math.round((rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000);
}

/**
 * Determines if a color is considered "dark"
 * @param hex - HEX color string
 * @param threshold - Brightness threshold (default: 128)
 * @returns True if color is dark
 */
export function isDarkColor(hex: string, threshold: number = 128): boolean {
  const brightness = getBrightness(hex);
  return brightness !== null && brightness < threshold;
}

/**
 * Lightens a color by a percentage
 * @param hex - HEX color string
 * @param percent - Percentage to lighten (0-100)
 * @returns Lightened HEX color string
 */
export function lightenColor(hex: string, percent: number): string | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;

  const amount = (percent / 100) * 255;
  const r = Math.min(255, rgb.r + amount);
  const g = Math.min(255, rgb.g + amount);
  const b = Math.min(255, rgb.b + amount);

  return rgbToHex(r, g, b);
}

/**
 * Darkens a color by a percentage
 * @param hex - HEX color string
 * @param percent - Percentage to darken (0-100)
 * @returns Darkened HEX color string
 */
export function darkenColor(hex: string, percent: number): string | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;

  const amount = (percent / 100) * 255;
  const r = Math.max(0, rgb.r - amount);
  const g = Math.max(0, rgb.g - amount);
  const b = Math.max(0, rgb.b - amount);

  return rgbToHex(r, g, b);
}

/**
 * Generates a color palette with shades
 * @param baseHex - Base HEX color
 * @param steps - Number of shades to generate (default: 5)
 * @returns Array of HEX color strings from light to dark
 */
export function generatePalette(baseHex: string, steps: number = 5): string[] {
  const palette: string[] = [];
  const stepSize = 100 / (steps + 1);

  for (let i = steps; i >= 1; i--) {
    const lightened = lightenColor(baseHex, stepSize * i);
    if (lightened) palette.push(lightened);
  }

  palette.push(baseHex);

  for (let i = 1; i <= steps; i++) {
    const darkened = darkenColor(baseHex, stepSize * i);
    if (darkened) palette.push(darkened);
  }

  return palette;
}
