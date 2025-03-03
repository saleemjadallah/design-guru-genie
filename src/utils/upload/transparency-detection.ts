
/**
 * Module for detecting transparency in images
 * Critical for ensuring compatibility with AI services
 */

/**
 * Detects if an image has transparency (alpha channel)
 * This is critical for Claude compatibility as transparent images often cause issues
 * @param img Image element to check
 * @returns Promise resolving to boolean indicating if transparency was detected
 */
export async function detectTransparency(img: HTMLImageElement): Promise<boolean> {
  console.log("Checking image for transparency/alpha channel");
  
  // Create a small canvas to sample the image
  const canvas = document.createElement('canvas');
  // Use a small size for performance - we just need to sample the image
  const sampleSize = Math.min(100, img.width, img.height);
  canvas.width = sampleSize;
  canvas.height = sampleSize;
  
  // Get context and draw a scaled version of the image
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    console.warn("Could not get canvas context for transparency detection");
    // If we can't detect, assume it might have transparency to be safe
    return true;
  }
  
  // Draw the image (scaled) to our sample canvas
  ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
  
  try {
    // Get the image data to analyze pixels
    const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
    const data = imageData.data;
    
    // Check for any transparent or semi-transparent pixels
    // Every 4th value in the array is the alpha channel (rgba)
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 255) {
        console.log(`Transparency detected! Alpha value: ${data[i]} at position ${i/4}`);
        return true;
      }
    }
    
    console.log("No transparency detected in image");
    return false;
  } catch (error) {
    console.warn("Error checking for transparency:", error);
    // If checking fails, assume it might have transparency to be safe
    return true;
  }
}

/**
 * Last resort manual handling for images with transparency
 * Creates a new canvas with white background and forces JPEG conversion
 * @param img Image element to process
 * @returns Promise resolving to JPEG data URL
 */
export async function manualTransparencyHandling(img: HTMLImageElement): Promise<string> {
  console.log("Using manual transparency handling with forced JPEG conversion");
  
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  
  // Try to use non-alpha context if available
  let ctx: CanvasRenderingContext2D | null;
  try {
    ctx = canvas.getContext('2d', { alpha: false });
  } catch (e) {
    // Fall back to standard context
    ctx = canvas.getContext('2d');
  }
  
  if (!ctx) {
    throw new Error('Failed to get canvas context for transparency handling');
  }
  
  // Fill with white background to eliminate transparency
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw the image over the white background
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  
  // Force JPEG format with high quality
  const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.9);
  
  console.log("Manual transparency handling complete - created JPEG with white background");
  return jpegDataUrl;
}
