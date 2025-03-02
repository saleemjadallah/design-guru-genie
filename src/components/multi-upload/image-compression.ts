
import { toast } from "@/hooks/use-toast";
import { compressImageForAPI } from "@/utils/upload/imageCompressionService";

/**
 * Compress an image blob with various compression settings
 */
export async function compressImage(
  blob: Blob, 
  options: { maxWidth: number; maxHeight: number; quality: number; maxSizeBytes: number }
): Promise<Blob> {
  const { maxWidth, maxHeight, quality, maxSizeBytes } = options;
  
  try {
    // Convert blob to URL for the compression service
    const blobUrl = URL.createObjectURL(blob);
    
    // Use the compressImageForAPI function from imageCompressionService
    const compressedDataUrl = await compressImageForAPI(blobUrl, {
      maxWidth,
      maxHeight,
      quality,
      maxSizeBytes
    });
    
    // Clean up the blob URL
    URL.revokeObjectURL(blobUrl);
    
    // Convert data URL back to blob
    const response = await fetch(compressedDataUrl);
    return await response.blob();
  } catch (error) {
    console.error("Compression error:", error);
    throw new Error(`Image compression failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Attempt to compress an image with multiple fallback compression settings
 */
export async function attemptImageCompression(
  blob: Blob, 
  maxSizeBytes: number = 4 * 1024 * 1024
): Promise<Blob> {
  // Check if compression is needed
  if (blob.size <= maxSizeBytes) {
    return blob;
  }
  
  let processedBlob = blob;
  
  // Initial compression attempt
  try {
    processedBlob = await compressImage(blob, {
      maxWidth: 1200, 
      maxHeight: 1600, 
      quality: 0.7,
      maxSizeBytes
    });
    console.log(`Compressed image from ${Math.round(blob.size/1024)}KB to ${Math.round(processedBlob.size/1024)}KB`);
    
    // If still too large, try more aggressive settings
    if (processedBlob.size > maxSizeBytes) {
      processedBlob = await compressImage(blob, {
        maxWidth: 800,
        maxHeight: 1200,
        quality: 0.6,
        maxSizeBytes
      });
      console.log(`Second compression attempt: ${Math.round(blob.size/1024)}KB to ${Math.round(processedBlob.size/1024)}KB`);
    }
    
    // Final emergency compression
    if (processedBlob.size > maxSizeBytes) {
      processedBlob = await compressImage(blob, {
        maxWidth: 600,
        maxHeight: 800,
        quality: 0.5,
        maxSizeBytes
      });
      console.log(`Emergency compression attempt: ${Math.round(blob.size/1024)}KB to ${Math.round(processedBlob.size/1024)}KB`);
    }
  } catch (err) {
    console.error("All compression attempts failed:", err);
    // Continue with the best result we have
  }
  
  return processedBlob;
}

/**
 * Verify the final image size is under the maximum allowed size
 */
export function verifyImageSize(blob: Blob, maxSizeBytes: number = 5 * 1024 * 1024): boolean {
  if (blob.size > maxSizeBytes) {
    toast({
      title: "Warning: Image Too Large",
      description: "The image exceeds 5MB even after compression. Please reduce image size or try fewer screenshots.",
      variant: "destructive",
    });
    return false;
  }
  return true;
}
