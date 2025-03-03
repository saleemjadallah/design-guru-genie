import type { ScreenshotFile } from "@/components/multi-upload/types";

/**
 * Stitches multiple screenshots together based on specified overlap
 * Completely rewritten to ensure Claude compatibility by:
 * 1. Using a non-alpha canvas with white background
 * 2. Enforcing JPEG format for the output
 * 3. Adding robust error handling and logging
 * 
 * @param screenshots Array of screenshot files to combine
 * @returns Promise resolving to the data URL of the combined image (always JPEG)
 */
export async function stitchImages(screenshots: ScreenshotFile[]): Promise<string> {
  console.log(`Starting to stitch ${screenshots.length} screenshots`);
  
  if (screenshots.length === 0) {
    throw new Error("No screenshots to stitch");
  }
  
  if (screenshots.length === 1) {
    // For single image, we still need to ensure JPEG format for Claude
    console.log("Only one screenshot, converting to JPEG format");
    return await convertToJPEG(screenshots[0].preview);
  }
  
  // Sort screenshots by order
  console.log("Sorting screenshots by order");
  const orderedScreenshots = [...screenshots].sort((a, b) => a.order - b.order);
  
  try {
    // Load all images first
    console.log("Loading all images");
    const loadedImages = await Promise.all(
      orderedScreenshots.map((screenshot) => loadImage(screenshot.preview))
    );
    
    // Calculate dimensions for the final canvas
    let totalHeight = 0;
    let maxWidth = 0;
    
    // Calculate the effective height after considering overlaps
    console.log("Calculating dimensions with overlaps");
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
    
    console.log(`Final dimensions: ${maxWidth}x${totalHeight}`);
    
    // Size sanity check - Claude has issues with very large images
    const totalPixels = maxWidth * totalHeight;
    if (totalPixels > 4000 * 3000) {
      console.warn(`Image is very large (${maxWidth}x${totalHeight}), ${totalPixels} pixels. This may cause issues with Claude.`);
      
      // If extremely large, apply scaling
      if (totalPixels > 8000 * 6000) {
        const scaleFactor = Math.sqrt((8000 * 6000) / totalPixels);
        console.log(`Scaling down by factor of ${scaleFactor}`);
        maxWidth = Math.floor(maxWidth * scaleFactor);
        totalHeight = Math.floor(totalHeight * scaleFactor);
        console.log(`Scaled dimensions: ${maxWidth}x${totalHeight}`);
      }
    }
    
    // Create canvas with the calculated dimensions
    const canvas = document.createElement("canvas");
    canvas.width = maxWidth;
    canvas.height = totalHeight;
    
    // CRITICAL: Create a non-alpha context to avoid transparency issues
    // This is key for Claude compatibility
    console.log("Creating canvas with non-alpha context");
    let ctx: CanvasRenderingContext2D | null = null;
    
    // First try with alpha: false for best compatibility
    try {
      ctx = canvas.getContext("2d", { alpha: false, willReadFrequently: true });
    } catch (ctxError) {
      console.warn("Failed to create non-alpha context, falling back to standard context:", ctxError);
    }
    
    // Fallback to standard context if needed
    if (!ctx) {
      ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        throw new Error("Could not get canvas context");
      }
    }
    
    // ALWAYS fill with white background - critical for Claude
    console.log("Filling canvas with white background");
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw each image on the canvas
    console.log("Drawing images on canvas");
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
    
    // Convert to PNG format with high quality
    // Claude API accepts PNG, JPEG, GIF, and WebP formats
    console.log("Converting canvas to PNG data URL");
    const pngDataUrl = canvas.toDataURL("image/png"); // Default is PNG with max quality
    
    // Check the size of the data URL
    const estimatedBytes = (pngDataUrl.length - 22) * 0.75; // base64 encoding overhead
    const estimatedSizeMB = estimatedBytes / (1024 * 1024);
    console.log(`Estimated PNG size: ${estimatedSizeMB.toFixed(2)}MB`);
    
    // If PNG is too large (over 4.5MB to be safe), fall back to JPEG
    if (estimatedSizeMB > 4.5) {
      console.log("PNG is too large, converting to JPEG for size reduction");
      const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.9); // High quality JPEG
      console.log("Stitching complete, JPEG data URL created");
      return jpegDataUrl;
    }
    
    console.log("Stitching complete, PNG data URL created");
    return pngDataUrl;
    
  } catch (error) {
    console.error("Error stitching images:", error);
    throw new Error(`Failed to stitch images: ${error instanceof Error ? error.message : String(error)}`);
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
    
    // Set crossOrigin to avoid CORS issues
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      console.log(`Loaded image: ${img.width}x${img.height}`);
      resolve(img);
    };
    
    img.onerror = (err) => {
      console.error("Image load error:", err);
      reject(new Error(`Failed to load image: ${src}`));
    };
    
    img.src = src;
  });
}

/**
 * Converts any image format to JPEG with white background
 * @param srcUrl Source image URL or data URL
 * @returns Promise resolving to JPEG data URL
 */
async function convertToJPEG(srcUrl: string): Promise<string> {
  console.log("Converting image to JPEG format");
  
  try {
    // Load the image
    const img = await loadImage(srcUrl);
    
    // Create a canvas with the image dimensions
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    
    // Try to get a non-alpha context first
    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = canvas.getContext("2d", { alpha: false });
    } catch (ctxError) {
      console.warn("Failed to create non-alpha context, falling back:", ctxError);
    }
    
    // Fallback to standard context if needed
    if (!ctx) {
      ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Could not get canvas context");
      }
    }
    
    // Always fill with white background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw the image on top of the white background
    ctx.drawImage(img, 0, 0);
    
    // Return as JPEG data URL
    const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.9);
    
    // Verify the output is actually JPEG format
    if (!jpegDataUrl.startsWith("data:image/jpeg")) {
      console.error("Output is not JPEG format! Actual format:", jpegDataUrl.substring(0, 30));
      
      // Try one more time with more explicit method
      return await ensureJPEGFormat(jpegDataUrl, img.width, img.height);
    }
    
    console.log("Conversion to JPEG successful");
    return jpegDataUrl;
  } catch (error) {
    console.error("Error converting to JPEG:", error);
    throw new Error(`Failed to convert image to JPEG: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Last resort function to ensure JPEG format using fetch and Blob conversion
 * @param dataUrl Input data URL of any format
 * @param width Image width
 * @param height Image height
 * @returns Promise resolving to JPEG data URL
 */
async function ensureJPEGFormat(dataUrl: string, width: number, height: number): Promise<string> {
  console.log("Using last resort JPEG conversion method");
  
  try {
    // Convert data URL to blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    
    // Create a new image from the blob
    const img = await createImageBitmap(blob);
    
    // Create a fresh canvas
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    
    // Get context and fill with white
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Could not get canvas context");
    }
    
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    
    // Explicitly request JPEG format
    return canvas.toDataURL("image/jpeg", 0.9);
  } catch (error) {
    console.error("Last resort conversion failed:", error);
    throw new Error("All JPEG conversion methods failed");
  }
}