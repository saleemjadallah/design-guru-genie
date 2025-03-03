
/**
 * Image compression service for Claude AI
 * Handles aggressive compression to ensure images are under API limits
 * And specifically addresses transparency issues with PNG images
 */

import { CompressionOptions } from "./compression-types";
import { detectTransparency, manualTransparencyHandling } from "./transparency-detection";
import { createCanvas, blobToDataUrl } from "./canvas-utils";

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

// Re-export functions for backwards compatibility
export { createCanvas } from './canvas-utils';
export { blobToDataUrl } from './canvas-utils';
