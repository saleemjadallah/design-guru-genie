
/**
 * Core compression operations for images
 */

import { createCanvas } from './canvas-utils';

/**
 * Performs a single compression attempt
 * @param img Source image
 * @param width Target width
 * @param height Target height
 * @param quality JPEG quality (0-1)
 * @returns Promise resolving to a blob
 */
export function compressAttempt(
  img: HTMLImageElement, 
  width: number, 
  height: number, 
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const { ctx, canvas } = createCanvas(img, width, height);
    
    // Draw the image onto the canvas
    ctx.drawImage(img, 0, 0, width, height);
    
    // Convert to JPEG blob
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to create image blob'));
          return;
        }
        resolve(blob);
      }, 
      'image/jpeg', 
      quality
    );
  });
}

/**
 * Performs multi-step compression to get the image under size limits
 * @param img Source image element
 * @param options Compression options
 * @returns Promise resolving to compressed data URL
 */
export async function performMultiStepCompression(
  img: HTMLImageElement,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    maxSizeBytes?: number;
    forceJpeg?: boolean;
  }
): Promise<string> {
  const { 
    maxWidth = 800,
    maxHeight = 1000,
    quality = 0.65,
    maxSizeBytes = 4 * 1024 * 1024,
  } = options;
  
  // Imported functions moved to separate modules
  const { calculateInitialDimensions, calculateNextCompressionSettings, prepareEmergencyCompression } = await import('./compression-calculations');
  const { blobToDataUrl } = await import('./canvas-utils');
  
  const { currentWidth, currentHeight } = calculateInitialDimensions(img, maxWidth, maxHeight);
  
  let width = currentWidth;
  let height = currentHeight;
  let currentQuality = quality;
  let attempt = 0;
  const maxAttempts = 4;
  
  while (attempt < maxAttempts) {
    attempt++;
    console.log(`Compression attempt ${attempt} with dimensions ${width}x${height} and quality ${currentQuality}`);
    
    // Attempt compression with current settings
    const blob = await compressAttempt(img, width, height, currentQuality);
    console.log(`Compressed to ${Math.round(blob.size/1024)}KB (attempt ${attempt})`);
    
    // If size is acceptable, convert to data URL and return
    if (blob.size <= maxSizeBytes || attempt >= maxAttempts) {
      // Final size check
      if (blob.size > 5 * 1024 * 1024) {
        console.warn(`CRITICAL: Image still over 5MB limit after ${attempt} compression attempts`);
        
        // Try emergency compression
        const emergency = prepareEmergencyCompression(width, height, attempt, maxAttempts);
        
        if (emergency.shouldTryEmergency) {
          width = emergency.width;
          height = emergency.height;
          currentQuality = 0.3;
          continue; // Try again with emergency settings
        }
        
        throw new Error(`Failed to compress image below 5MB limit. Final size: ${(blob.size / (1024 * 1024)).toFixed(2)}MB`);
      }
      
      const dataUrl = await blobToDataUrl(blob);
      console.log(`Final compressed size: ${Math.round(blob.size/1024)}KB after ${attempt} attempts`);
      console.log(`Output format: JPEG as data URL (first 30 chars): ${dataUrl.substring(0, 30)}...`);
      
      return dataUrl;
    }
    
    // Calculate more aggressive settings for next attempt
    const nextSettings = calculateNextCompressionSettings(
      width, 
      height, 
      currentQuality, 
      blob.size, 
      maxSizeBytes
    );
    
    width = nextSettings.newWidth;
    height = nextSettings.newHeight;
    currentQuality = nextSettings.newQuality;
  }
  
  throw new Error('Failed to compress image after maximum attempts');
}
