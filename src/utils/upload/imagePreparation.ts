import { toast } from "@/hooks/use-toast";
import { compressImageForAPI } from "@/utils/upload/imageCompressionService";
import { CompressionOptions } from "@/utils/upload/compression-types";
import { validateDataUrlSize, verifyFinalImageSize } from "@/utils/upload/sizeValidation";

/**
 * Compresses an image URL for Claude AI processing
 * @param imageUrl URL to compress
 * @param compressionOptions Options for compression
 * @returns Promise resolving to compressed image URL
 */
export async function prepareImageForAnalysis(imageUrl: string, compressionOptions: CompressionOptions = {}): Promise<string> {
  try {
    console.log("Compressing image before analysis...");
    const mergedOptions = {
      maxWidth: compressionOptions.maxWidth || 800,     // Reduced default
      maxHeight: compressionOptions.maxHeight || 1000,  // Same default
      quality: compressionOptions.quality || 0.65,      // Lower quality default
      maxSizeBytes: 4 * 1024 * 1024, // Ensure 4MB limit (safely under 5MB)
      forceJpeg: true // CRITICAL: Always force JPEG conversion
    };
    
    const compressedImageUrl = await compressImageForAPI(imageUrl, mergedOptions);
    console.log("Image compressed successfully to data URL");
    
    // Validate size
    if (compressedImageUrl.startsWith('data:')) {
      validateDataUrlSize(compressedImageUrl);
    } else {
      await verifyFinalImageSize(compressedImageUrl);
    }
    
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
    
    // Otherwise continue with the original URL - compression is optional
    return imageUrl;
  }
}
