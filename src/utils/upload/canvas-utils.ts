
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
  return createCanvasWithOptions(width, height, options, img);
}

/**
 * Creates a canvas with specific dimensions and context options
 * @param width Target width
 * @param height Target height
 * @param options Options for canvas creation
 * @param img Optional source image for transparency detection
 * @returns Canvas context and canvas element
 */
export function createCanvasWithOptions(
  width: number,
  height: number,
  options: {
    removeTransparency?: boolean;
    forceNoAlpha?: boolean;
  } = {},
  img?: HTMLImageElement
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
      ctx = createNonAlphaContext(canvas);
    } catch (e) {
      console.warn("Failed to create non-alpha context, falling back to standard context");
    }
  }
  
  // Fall back to standard context if needed
  if (!ctx) {
    ctx = createStandardContext(canvas, options.removeTransparency);
  }
  
  // Check if the image appears to have transparency
  if (img && isPotentiallyTransparent(img)) {
    hasTransparency = true;
  }
  
  return { ctx, canvas, hasTransparency };
}

/**
 * Creates a non-alpha canvas context
 * @param canvas Canvas element
 * @returns Non-alpha canvas context
 */
function createNonAlphaContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D | null {
  const ctx = canvas.getContext('2d', { 
    alpha: false, // Disable alpha channel entirely
    willReadFrequently: false 
  });
  
  if (ctx) {
    console.log("Using non-alpha canvas context for transparency removal");
  }
  
  return ctx;
}

/**
 * Creates a standard canvas context with optional transparency removal
 * @param canvas Canvas element
 * @param removeTransparency Whether to remove transparency by filling with white
 * @returns Standard canvas context
 */
function createStandardContext(
  canvas: HTMLCanvasElement, 
  removeTransparency?: boolean
): CanvasRenderingContext2D {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }
  
  // With standard context, we have to manually handle transparency
  // by filling with white background explicitly
  if (removeTransparency) {
    // Fill with white background for transparency removal
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    console.log("Applied white background to remove transparency");
  }
  
  return ctx;
}

/**
 * Checks if an image might have transparency
 * @param img Source image
 * @returns True if the image possibly has transparency
 */
function isPotentiallyTransparent(img: HTMLImageElement): boolean {
  // This is a simplified check compared to the full pixel-level detection
  return img.src.includes('.png') || img.src.includes('data:image/png');
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
