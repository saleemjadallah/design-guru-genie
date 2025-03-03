
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
 * @param options Additional options for compression
 * @returns Promise resolving to a blob
 */
export function compressAttempt(
  img: HTMLImageElement, 
  width: number, 
  height: number, 
  quality: number,
  options: { 
    removeTransparency?: boolean,
    outputFormat?: string
  } = {}
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // Create canvas with specific options for transparency handling
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    // Try to use non-alpha context if transparency should be removed
    let ctx: CanvasRenderingContext2D | null;
    if (options.removeTransparency) {
      try {
        // First try with alpha: false for best transparency handling
        ctx = canvas.getContext('2d', { alpha: false });
        console.log("Using non-alpha canvas context to eliminate transparency");
      } catch (e) {
        console.warn("Failed to create non-alpha context, falling back to standard context");
        ctx = canvas.getContext('2d');
      }
    } else {
      // Standard context if we don't need to specifically handle transparency
      ctx = canvas.getContext('2d');
    }
    
    if (!ctx) {
      reject(new Error('Failed to get canvas context for compression'));
      return;
    }
    
    // Always fill with white background when removing transparency
    if (options.removeTransparency) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      console.log("Applied white background to remove transparency");
    }
    
    // Draw the image onto the canvas
    ctx.drawImage(img, 0, 0, width, height);
    
    // Determine output format - default to JPEG for transparency removal
    const outputFormat = options.removeTransparency ? 'image/jpeg' : (options.outputFormat || 'image/jpeg');
    
    // Convert to blob with the determined format
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to create image blob'));
          return;
        }
        
        // Log format info
        console.log(`Created ${blob.type} blob: ${Math.round(blob.size/1024)}KB` +
                   `${options.removeTransparency ? ' (transparency removed)' : ''}`);
        
        resolve(blob);
      }, 
      outputFormat, 
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
    removeTransparency?: boolean;
  }
): Promise<string> {
  const { 
    maxWidth = 800,
    maxHeight = 1000,
    quality = 0.65,
    maxSizeBytes = 4 * 1024 * 1024,
    forceJpeg = false,
    removeTransparency = false
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
  
  // Log transparency handling settings
  console.log(`Compression options: forceJpeg=${forceJpeg}, removeTransparency=${removeTransparency}`);
  if (removeTransparency) {
    console.log("Transparency removal enabled - will create JPEG with white background");
  }
  
  // Determine the output format based on options
  const outputFormat = forceJpeg || removeTransparency ? 'image/jpeg' : 'image/png';
  
  while (attempt < maxAttempts) {
    attempt++;
    console.log(`Compression attempt ${attempt} with dimensions ${width}x${height} and quality ${currentQuality}`);
    
    // Attempt compression with current settings and transparency handling
    const blob = await compressAttempt(img, width, height, currentQuality, {
      removeTransparency: removeTransparency,
      outputFormat: outputFormat
    });
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
          // In emergency mode, always force JPEG and remove transparency
          continue; // Try again with emergency settings
        }
        
        throw new Error(`Failed to compress image below 5MB limit. Final size: ${(blob.size / (1024 * 1024)).toFixed(2)}MB`);
      }
      
      const dataUrl = await blobToDataUrl(blob);
      console.log(`Final compressed size: ${Math.round(blob.size/1024)}KB after ${attempt} attempts`);
      
      // Verify output format for debugging
      const actualFormat = dataUrl.startsWith('data:image/jpeg') ? 'JPEG' : 
                          dataUrl.startsWith('data:image/png') ? 'PNG' : 
                          'unknown';
      console.log(`Output format: ${actualFormat} as data URL (first 30 chars): ${dataUrl.substring(0, 30)}...`);
      
      // Final verification for transparency handling
      if (removeTransparency && !dataUrl.startsWith('data:image/jpeg')) {
        console.warn("WARNING: Image with transparency was not converted to JPEG as requested!");
      }
      
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
