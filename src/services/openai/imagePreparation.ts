
import { toast } from "@/hooks/use-toast";
import { compressImageForAPI } from "@/utils/upload/imageCompressionService";
import { CompressionOptions } from "@/services/openai/types";

/**
 * Compresses an image URL for OpenAI processing
 */
export async function prepareImageForAnalysis(imageUrl: string, compressionOptions: CompressionOptions = {}) {
  try {
    console.log("Compressing image before analysis...");
    const mergedOptions = {
      maxWidth: compressionOptions.maxWidth || 800,
      maxHeight: compressionOptions.maxHeight || 1000,
      quality: compressionOptions.quality || 0.65,
      maxSizeBytes: 4 * 1024 * 1024, // Ensure 4MB limit
      forceJpeg: true // CRITICAL: Always force JPEG conversion
    };
    
    const compressedImageUrl = await compressImageForAPI(imageUrl, mergedOptions);
    console.log("Image compressed successfully");
    
    return compressedImageUrl;
  } catch (compressionError: any) {
    console.warn("Image compression failed, proceeding with original:", compressionError);
    
    // If compression failed due to size, we must stop here
    if (compressionError.message && compressionError.message.includes("too large")) {
      toast({
        title: "Image too large",
        description: compressionError.message,
        variant: "destructive",
      });
      throw compressionError;
    }
    
    // Otherwise continue with the original URL
    return imageUrl;
  }
}

/**
 * Cleans up URL object references to prevent memory leaks
 */
export function cleanupUrls(originalUrl: string, processedUrl: string): void {
  if (originalUrl.startsWith('blob:')) {
    console.log("Revoking blob URL to prevent memory leaks");
    URL.revokeObjectURL(originalUrl);
  }
  
  if (processedUrl !== originalUrl && processedUrl.startsWith('blob:')) {
    console.log("Revoking intermediate blob URL");
    URL.revokeObjectURL(processedUrl);
  }
}
