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
 * Creates a canvas for image processing
 * @param img The source image
 * @param width Target width
 * @param height Target height
 * @returns Canvas context and canvas element
 */
function createCanvas(img: HTMLImageElement, width: number, height: number): { 
  ctx: CanvasRenderingContext2D; 
  canvas: HTMLCanvasElement 
} {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }
  
  // IMPORTANT: Always use white background for transparent images
  // This ensures Claude doesn't get confused by transparency
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  return { ctx, canvas };
}

/**
 * Determines initial dimensions for compression
 * @param img Source image
 * @param maxWidth Maximum width target
 * @param maxHeight Maximum height target
 * @returns Initial dimensions to use
 */
function calculateInitialDimensions(
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
 * Performs a single compression attempt
 * @param img Source image
 * @param width Target width
 * @param height Target height
 * @param quality JPEG quality (0-1)
 * @returns Promise resolving to a blob
 */
function compressAttempt(
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
 * Calculates more aggressive compression settings for next attempt
 * @param currentWidth Current width
 * @param currentHeight Current height
 * @param currentQuality Current quality
 * @param blobSize Current blob size
 * @param maxSizeBytes Target max size
 * @returns New settings for next attempt
 */
function calculateNextCompressionSettings(
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
 * @param img Source image
 * @param width Current width
 * @param height Current height
 * @param attempt Current attempt count
 * @param maxAttempts Maximum attempts allowed
 * @returns New dimensions and flag to try emergency compression
 */
function prepareEmergencyCompression(
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

/**
 * Converts blob to data URL
 * @param blob Source blob
 * @returns Promise resolving to data URL
 */
function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = () => reject(new Error('Failed to convert image to data URL'));
    reader.readAsDataURL(blob);
  });
}

/**
 * Performs multi-step compression to get the image under size limits
 * @param img Source image element
 * @param options Compression options
 * @returns Promise resolving to compressed data URL
 */
async function performMultiStepCompression(
  img: HTMLImageElement,
  options: CompressionOptions
): Promise<string> {
  const { 
    maxWidth = 800,
    maxHeight = 1000,
    quality = 0.65,
    maxSizeBytes = 4 * 1024 * 1024,
    forceJpeg = true
  } = options;
  
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
