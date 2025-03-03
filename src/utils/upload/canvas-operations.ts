
/**
 * Canvas drawing and manipulation operations
 */

/**
 * Draws an image on a canvas with specific dimensions
 * @param ctx Canvas context
 * @param img Source image
 * @param x X coordinate
 * @param y Y coordinate
 * @param width Target width
 * @param height Target height
 * @returns True if operation succeeded
 */
export function drawImageToCanvas(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number = 0,
  y: number = 0,
  width?: number,
  height?: number
): boolean {
  try {
    if (width !== undefined && height !== undefined) {
      ctx.drawImage(img, x, y, width, height);
    } else {
      ctx.drawImage(img, x, y);
    }
    return true;
  } catch (error) {
    console.error("Error drawing image on canvas:", error);
    return false;
  }
}

/**
 * Extracts image data from a canvas
 * @param canvas Source canvas
 * @param format Image format (default: 'image/jpeg')
 * @param quality Image quality (default: 0.9)
 * @returns Data URL of the canvas content
 */
export function canvasToDataUrl(
  canvas: HTMLCanvasElement,
  format: string = 'image/jpeg',
  quality: number = 0.9
): string {
  return canvas.toDataURL(format, quality);
}

/**
 * Converts a canvas to a Blob
 * @param canvas Source canvas
 * @param format Image format (default: 'image/jpeg')
 * @param quality Image quality (default: 0.9)
 * @returns Promise resolving to Blob
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: string = 'image/jpeg',
  quality: number = 0.9
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert canvas to blob'));
        }
      },
      format,
      quality
    );
  });
}

/**
 * Fills a canvas with a solid color
 * @param ctx Canvas context
 * @param color Fill color
 */
export function fillCanvas(
  ctx: CanvasRenderingContext2D,
  color: string = '#FFFFFF'
): void {
  const canvas = ctx.canvas;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

/**
 * Clears a canvas
 * @param ctx Canvas context
 */
export function clearCanvas(ctx: CanvasRenderingContext2D): void {
  const canvas = ctx.canvas;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
