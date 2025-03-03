
/**
 * Canvas utility functions for image processing
 */

/**
 * Creates a canvas for image processing with specific options for transparency handling
 * @param img The source image
 * @param width Target width
 * @param height Target height
 * @param options Additional options for canvas creation
 * @returns Canvas context and canvas element
 */
export function createCanvas(
  img: HTMLImageElement, 
  width: number, 
  height: number,
  options: {
    removeTransparency?: boolean;
    forceNoAlpha?: boolean;
  } = { removeTransparency: true, forceNoAlpha: false }
): { 
  ctx: CanvasRenderingContext2D; 
  canvas: HTMLCanvasElement;
  hasTransparency?: boolean;
} {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  // Track if we detect transparency
  let hasTransparency = false;
  
  // Try to use non-alpha context for best transparency handling if requested
  let ctx: CanvasRenderingContext2D | null = null;
  
  if (options.removeTransparency || options.forceNoAlpha) {
    try {
      ctx = canvas.getContext('2d', { 
        alpha: false, // Disable alpha channel entirely
        willReadFrequently: false 
      });
      console.log("Using non-alpha canvas context for transparency removal");
    } catch (e) {
      console.warn("Failed to create non-alpha context, falling back to standard context");
    }
  }
  
  // Fall back to standard context if needed
  if (!ctx) {
    ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }
    
    // With standard context, we have to manually handle transparency
    // by filling with white background explicitly
    if (options.removeTransparency) {
      // Fill with white background for transparency removal
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      console.log("Applied white background to remove transparency");
    }
  }
  
  // Check if the image appears to have transparency
  // This is a simplified check compared to the full pixel-level detection
  if (img.src.includes('.png') || img.src.includes('data:image/png')) {
    // For PNG images, assume they might have transparency
    hasTransparency = true;
  }
  
  return { ctx, canvas, hasTransparency };
}

/**
 * Converts blob to data URL
 * @param blob Source blob
 * @returns Promise resolving to data URL
 */
export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = () => reject(new Error('Failed to convert image to data URL'));
    reader.readAsDataURL(blob);
  });
}
