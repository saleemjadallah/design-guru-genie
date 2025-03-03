
import { toast } from "@/hooks/use-toast";
import { compressImageForAPI } from "@/utils/upload/imageCompressionService";
import { CompressionOptions } from "@/utils/upload/compression-types";

/**
 * Compresses an image URL for OpenAI processing
 */
/**
 * Prepares an image for OpenAI analysis with improved quality settings
 * Uses a single compression pass with better balance of quality and size
 * Improved from previous version that used overly aggressive compression
 */
export async function prepareImageForAnalysis(imageUrl: string, compressionOptions: CompressionOptions = {}) {
  try {
    console.log("Preparing image for OpenAI analysis...");
    
    // Use more balanced compression settings for better analysis quality
    // Increased dimensions and quality for detailed UI designs
    const mergedOptions = {
      maxWidth: compressionOptions.maxWidth || 1200,  // Increased from 800
      maxHeight: compressionOptions.maxHeight || 1600, // Increased from 1000
      quality: compressionOptions.quality || 0.8,     // Increased from 0.65
      maxSizeBytes: 5 * 1024 * 1024, // Increased to 5MB for better quality
      forceJpeg: true, // CRITICAL: Always force JPEG conversion for compatibility
      detectTransparency: true, // Enable transparency detection
      preserveDetails: true // Request high-quality compression for UI details
    };
    
    // Log compression settings to help with debugging
    console.log(`Using compression settings: ${JSON.stringify(mergedOptions)}`);
    
    // Single compression pass with better settings
    const compressedImageUrl = await compressImageForAPI(imageUrl, mergedOptions);
    
    // Verify the result is valid
    if (!compressedImageUrl || typeof compressedImageUrl !== 'string') {
      throw new Error("Invalid compression result");
    }
    
    console.log("Image prepared successfully for OpenAI analysis");
    return compressedImageUrl;
  } catch (compressionError: any) {
    console.warn("Image preparation failed:", compressionError);
    
    // Check for specific compression errors
    if (compressionError.message && compressionError.message.includes("too large")) {
      toast({
        title: "Image too large",
        description: "Your image exceeds the 5MB limit even after compression. Please try a smaller image or reduce its dimensions.",
        variant: "destructive",
      });
      throw compressionError;
    }
    
    // For transparency issues, add a specific message
    if (compressionError.message && (
        compressionError.message.includes("transparency") || 
        compressionError.message.includes("alpha"))) {
      toast({
        title: "Transparency issue",
        description: "Your image contains transparency which may affect analysis quality. We've attempted to fix this automatically.",
        variant: "warning",
      });
      // Continue with original as we've warned the user
    }
    
    // Otherwise continue with the original URL
    console.log("Falling back to original image URL");
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
