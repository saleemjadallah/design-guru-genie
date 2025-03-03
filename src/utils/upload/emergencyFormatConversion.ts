
/**
 * Emergency function to ensure data URL is in a valid format and size for Claude API
 * @param dataUrl Input data URL of any format
 * @returns Promise resolving to properly formatted data URL
 */
export async function emergencyConvertToJpeg(dataUrl: string): Promise<string> {
  console.log("Starting emergency image format verification");
  
  try {
    // Convert data URL to blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    
    // Check if format is already acceptable
    if (blob.type === 'image/jpeg' || blob.type === 'image/png' || 
        blob.type === 'image/gif' || blob.type === 'image/webp') {
      
      // If size is good and format is supported, use as is
      if (blob.size <= 4.5 * 1024 * 1024) {
        console.log(`No conversion needed - format ${blob.type} is supported and size is acceptable`);
        return dataUrl;
      }
      
      console.log(`Format ${blob.type} is supported but size (${Math.round(blob.size/(1024*1024))}MB) is large. Compressing.`);
    } else {
      console.log(`Format ${blob.type} may not be supported. Converting to PNG.`);
    }
    
    // Create a new image from the blob
    const img = await createImageBitmap(blob);
    console.log(`Created image bitmap: ${img.width}x${img.height}`);
    
    // Create a canvas with the image dimensions
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    
    // Get context
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to get canvas context for conversion");
    }
    
    // Draw the image (no need for special handling)
    ctx.drawImage(img, 0, 0);
    
    // Try PNG format first
    const pngDataUrl = canvas.toDataURL("image/png");
    const pngSize = (pngDataUrl.length - 22) * 0.75 / (1024 * 1024); // Estimate size in MB
    
    if (pngSize <= 4.5) {
      console.log(`Converted to PNG: estimated ${pngSize.toFixed(2)}MB`);
      return pngDataUrl;
    }
    
    // If PNG is too large, try JPEG
    console.log(`PNG too large (${pngSize.toFixed(2)}MB). Trying JPEG format`);
    const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.9);
    
    console.log("Converted to JPEG format");
    return jpegDataUrl;
  } catch (error) {
    console.error("Error in image format conversion:", error);
    throw new Error(`Format conversion failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
