
import type { ScreenshotFile } from "@/components/multi-upload/MultiScreenshotUpload";

/**
 * Stitches multiple screenshots together based on specified overlap
 * @param screenshots Array of screenshot files to combine
 * @returns Promise resolving to the data URL of the combined image
 */
export async function stitchImages(screenshots: ScreenshotFile[]): Promise<string> {
  if (screenshots.length === 0) {
    throw new Error("No screenshots to stitch");
  }
  
  if (screenshots.length === 1) {
    return screenshots[0].preview; // Return the single image as is
  }
  
  // Sort screenshots by order
  const orderedScreenshots = [...screenshots].sort((a, b) => a.order - b.order);
  
  try {
    // Load all images first
    const loadedImages = await Promise.all(
      orderedScreenshots.map((screenshot) => loadImage(screenshot.preview))
    );
    
    // Calculate dimensions for the final canvas
    let totalHeight = 0;
    let maxWidth = 0;
    
    // Calculate the effective height after considering overlaps
    for (let i = 0; i < loadedImages.length; i++) {
      const img = loadedImages[i];
      maxWidth = Math.max(maxWidth, img.width);
      
      if (i === 0) {
        totalHeight = img.height;
      } else {
        // Subtract the overlap from the height
        const overlapPercent = orderedScreenshots[i - 1].overlap / 100;
        const overlapPixels = Math.round(img.height * overlapPercent);
        totalHeight += img.height - overlapPixels;
      }
    }
    
    // Create canvas with the calculated dimensions
    const canvas = document.createElement("canvas");
    canvas.width = maxWidth;
    canvas.height = totalHeight;
    const ctx = canvas.getContext("2d");
    
    if (!ctx) {
      throw new Error("Could not get canvas context");
    }
    
    // Draw each image on the canvas
    let currentY = 0;
    
    for (let i = 0; i < loadedImages.length; i++) {
      const img = loadedImages[i];
      
      // Center horizontally if the image is narrower than the canvas
      const x = Math.max(0, (maxWidth - img.width) / 2);
      
      if (i === 0) {
        // First image - draw it completely
        ctx.drawImage(img, x, currentY);
        currentY += img.height;
      } else {
        // Calculate overlap
        const overlapPercent = orderedScreenshots[i - 1].overlap / 100;
        const overlapPixels = Math.round(img.height * overlapPercent);
        
        // Adjust currentY to account for overlap
        currentY -= overlapPixels;
        
        // For subsequent images, blend the overlapping regions
        ctx.drawImage(img, x, currentY);
        currentY += img.height;
      }
    }
    
    // Return the data URL of the combined image
    return canvas.toDataURL("image/png");
    
  } catch (error) {
    console.error("Error stitching images:", error);
    throw new Error("Failed to stitch images");
  }
}

/**
 * Loads an image from a URL and returns an HTMLImageElement
 * @param src Image source URL
 * @returns Promise resolving to the loaded image
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}
