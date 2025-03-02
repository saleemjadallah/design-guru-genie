
/**
 * Functions for calculating compression settings
 */

/**
 * Determines initial dimensions for compression
 * @param img Source image
 * @param maxWidth Maximum width target
 * @param maxHeight Maximum height target
 * @returns Initial dimensions to use
 */
export function calculateInitialDimensions(
  img: HTMLImageElement, 
  maxWidth: number, 
  maxHeight: number
): { currentWidth: number; currentHeight: number } {
  let currentWidth = Math.min(img.width, maxWidth);
  let currentHeight = Math.min(img.height, maxHeight);
  
  // For very large images, apply more aggressive initial reduction
  if (img.width * img.height > 2000000) { // > 2 megapixels
    const scaleFactor = Math.sqrt(2000000 / (img.width * img.height));
    currentWidth = Math.floor(img.width * scaleFactor);
    currentHeight = Math.floor(img.height * scaleFactor);
    console.log(`Initial aggressive resize to ${currentWidth}x${currentHeight}`);
  }
  
  return { currentWidth, currentHeight };
}

/**
 * Calculates more aggressive compression settings for next attempt
 * @param currentWidth Current width
 * @param currentHeight Current height
 * @param currentQuality Current quality
 * @param blobSize Current blob size
 * @param maxSizeBytes Target max size
 * @returns New settings for next attempt
 */
export function calculateNextCompressionSettings(
  currentWidth: number,
  currentHeight: number,
  currentQuality: number,
  blobSize: number,
  maxSizeBytes: number
): { newWidth: number; newHeight: number; newQuality: number } {
  // Reduce dimensions and quality more aggressively with each attempt
  const scaleFactor = Math.min(0.8, Math.sqrt(maxSizeBytes / blobSize));
  
  const newWidth = Math.floor(currentWidth * scaleFactor);
  const newHeight = Math.floor(currentHeight * scaleFactor);
  const newQuality = Math.max(0.4, currentQuality - 0.15); // More aggressive quality reduction
  
  return { newWidth, newHeight, newQuality };
}

/**
 * Performs emergency compression for images still over the limit
 * @param width Current width
 * @param height Current height
 * @param attempt Current attempt count
 * @param maxAttempts Maximum attempts allowed
 * @returns New dimensions and flag to try emergency compression
 */
export function prepareEmergencyCompression(
  width: number,
  height: number,
  attempt: number,
  maxAttempts: number
): { width: number; height: number; shouldTryEmergency: boolean } {
  // Emergency compression - final desperate attempt with very low quality
  if (attempt < maxAttempts) {
    return {
      width: Math.floor(width * 0.7),
      height: Math.floor(height * 0.7),
      shouldTryEmergency: true
    };
  }
  
  return { width, height, shouldTryEmergency: false };
}
