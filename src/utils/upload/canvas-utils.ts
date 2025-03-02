
/**
 * Canvas utility functions for image processing
 */

/**
 * Creates a canvas for image processing
 * @param img The source image
 * @param width Target width
 * @param height Target height
 * @returns Canvas context and canvas element
 */
export function createCanvas(img: HTMLImageElement, width: number, height: number): { 
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
