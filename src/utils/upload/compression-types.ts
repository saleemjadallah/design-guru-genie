
/**
 * Types for image compression utilities
 */

/**
 * Configuration options for image compression
 */
export interface CompressionOptions {
  maxWidth?: number;      // Maximum width to resize image to
  maxHeight?: number;     // Maximum height to resize image to
  quality?: number;       // JPEG quality factor (0-1)
  maxSizeBytes?: number;  // Maximum size target in bytes
  forceJpeg?: boolean;    // Whether to force JPEG format regardless of input
  removeTransparency?: boolean; // Whether to remove transparency (replace with white)
}

/**
 * Configuration for transparency handling
 */
export interface TransparencyOptions {
  removeTransparency?: boolean;
  forceNoAlpha?: boolean;
}

// Export all types for use in other modules
export type { CompressionOptions, TransparencyOptions };
