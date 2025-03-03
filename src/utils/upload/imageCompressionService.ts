
/**
 * Image compression service for Claude AI
 * Handles aggressive compression to ensure images are under API limits
 * And specifically addresses transparency issues with PNG images
 */

// Define compression options interface
export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeBytes?: number;
  forceJpeg?: boolean;
  removeTransparency?: boolean; // Add explicit option to handle transparency
}

/**
 * Detects if an image has transparency (alpha channel)
 * This is critical for Claude compatibility as transparent images often cause issues
 * @param img Image element to check
 * @returns Promise resolving to boolean indicating if transparency was detected
 */
async function detectTransparency(img: HTMLImageElement): Promise<boolean> {
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
 * Main compression function
 * Compresses an image to ensure it's under the size limit for API requests
 * Uses multiple compression attempts with increasingly aggressive settings
 * Always converts to JPEG format for Claude compatibility
 * Now specifically handles transparency detection and removal
 */
export async function compressImageForAPI(
  imageUrl: string, 
  options: CompressionOptions = {}
): Promise<string> {
  try {
    console.log("Starting image compression for Claude API, source URL type:", 
               imageUrl.startsWith('data:') ? 'data URL' : 
               imageUrl.startsWith('blob:') ? 'blob URL' : 'remote URL');
               
    // For blob URLs or remote URLs
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    console.log(`Original image: format=${blob.type}, size=${Math.round(blob.size/1024)}KB`);
    
    // Flag potentially problematic formats that might have transparency
    const potentiallyTransparent = blob.type.includes('png') || 
                                  blob.type.includes('webp') || 
                                  blob.type.includes('gif') || 
                                  blob.type.includes('svg');
    
    // Always remove transparency for potentially transparent formats
    const shouldRemoveTransparency = potentiallyTransparent || 
                                     (options.removeTransparency !== false);
    
    if (potentiallyTransparent) {
      console.warn(`${blob.type} format detected - this may have transparency which Claude can't process correctly`);
    }
    
    // Import the performMultiStepCompression function dynamically
    const { performMultiStepCompression } = await import('./compression-operations');
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = async () => {
        try {
          // Check for transparency in the loaded image
          const hasTransparency = await detectTransparency(img);
          
          if (hasTransparency) {
            console.warn("Transparency detected in image - will convert to JPEG with white background");
            
            // Special handling for images with transparency
            options.forceJpeg = true; // Force JPEG for transparent images
            options.removeTransparency = true; // Explicitly request transparency removal
            options.quality = options.quality || 0.9; // Use higher quality to preserve details
          }
          
          // Process the image with transparency settings
          const dataUrl = await performMultiStepCompression(img, {
            ...options,
            forceJpeg: shouldRemoveTransparency ? true : options.forceJpeg,
            removeTransparency: shouldRemoveTransparency
          });
          
          // Verify the output is JPEG if we needed to remove transparency
          if (shouldRemoveTransparency && !dataUrl.startsWith('data:image/jpeg')) {
            console.error("Failed to convert transparent image to JPEG format!");
            // Fall back to manual conversion as a last resort
            const finalJpeg = await manualTransparencyHandling(img);
            resolve(finalJpeg);
          } else {
            resolve(dataUrl);
          }
        } catch (error) {
          reject(error);
        } finally {
          // Clean up the object URL
          URL.revokeObjectURL(img.src);
        }
      };
      
      img.onerror = (err) => {
        URL.revokeObjectURL(img.src);
        console.error("Image loading error:", err);
        reject(new Error(`Failed to load image for compression: ${err}`));
      };
      
      // Set crossOrigin attribute for CORS issues with remote images
      if (!imageUrl.startsWith('data:') && !imageUrl.startsWith('blob:')) {
        img.crossOrigin = "anonymous";
      }
      
      img.src = URL.createObjectURL(blob);
    });
  } catch (error: any) {
    console.error('Image compression error:', error);
    throw new Error(`Failed to compress image: ${error.message}`);
  }
}

/**
 * Last resort manual handling for images with transparency
 * Creates a new canvas with white background and forces JPEG conversion
 * @param img Image element to process
 * @returns Promise resolving to JPEG data URL
 */
async function manualTransparencyHandling(img: HTMLImageElement): Promise<string> {
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

// Re-export functions from canvas-utils for backwards compatibility
export { createCanvas } from './canvas-utils';
export { blobToDataUrl } from './canvas-utils';
