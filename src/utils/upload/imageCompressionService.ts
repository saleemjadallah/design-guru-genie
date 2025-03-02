
/**
 * Image compression service for Claude AI
 * Handles aggressive compression to ensure images are under API limits
 */

// Define compression options interface
export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeBytes?: number;
  forceJpeg?: boolean;
}

/**
 * Main compression function
 * Compresses an image to ensure it's under the size limit for API requests
 * Uses multiple compression attempts with increasingly aggressive settings
 * Always converts to JPEG format for Claude compatibility
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
    
    // Check if the image is SVG or has transparency - Claude might have issues with these
    // We explicitly log warning now for SVG, WebP, and PNG formats
    if (blob.type.includes('svg') || blob.type.includes('webp') || blob.type.includes('png')) {
      console.warn(`${blob.type} format detected - converting to JPEG for better Claude compatibility`);
    }
    
    // Import the performMultiStepCompression function dynamically
    const { performMultiStepCompression } = await import('./compression-operations');
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = async () => {
        try {
          const dataUrl = await performMultiStepCompression(img, {
            ...options,
            forceJpeg: true
          });
          resolve(dataUrl);
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

// Re-export functions from canvas-utils for backwards compatibility
export { createCanvas } from './canvas-utils';
export { blobToDataUrl } from './canvas-utils';
