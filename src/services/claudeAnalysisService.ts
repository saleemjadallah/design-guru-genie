import { toast } from "@/hooks/use-toast";
import { handleAnalysisError } from "@/utils/upload/errorHandler";
import { compressImageForAPI, CompressionOptions } from "@/utils/upload/imageCompressionService";
import { uploadBlobToSupabase, validateImageUrl } from "@/utils/upload/imageUploadService";
import { callClaudeAnalysisAPI, processClaudeResponse } from "@/services/claudeApiService";

/**
 * Main function to process an image with Claude AI analysis
 * Handles preprocessing, API calls, and error handling
 */
export async function processWithClaudeAI(imageUrl: string, compressionOptions: CompressionOptions = {}) {
  try {
    // Check if the image is a local blob URL that needs to be uploaded to Supabase
    if (imageUrl.startsWith('blob:')) {
      imageUrl = await uploadBlobToSupabase(imageUrl);
    }
    
    // Validate the image URL
    validateImageUrl(imageUrl);
    
    // Compress image before sending to Claude with more aggressive compression
    try {
      console.log("Compressing image before analysis...");
      const mergedOptions = {
        maxWidth: compressionOptions.maxWidth || 800,     // Reduced default
        maxHeight: compressionOptions.maxHeight || 1000,  // Same default
        quality: compressionOptions.quality || 0.65,      // Lower quality default
        maxSizeBytes: 4 * 1024 * 1024 // Ensure 4MB limit (safely under 5MB)
      };
      
      const compressedImageUrl = await compressImageForAPI(imageUrl, mergedOptions);
      console.log("Image compressed successfully");
      
      // Verify compressed image size
      try {
        const response = await fetch(compressedImageUrl);
        const blob = await response.blob();
        const sizeMB = blob.size / (1024 * 1024);
        console.log(`Final compressed image size: ${sizeMB.toFixed(2)}MB`);
        
        // Final size check with clear error message
        if (sizeMB > 5) {
          throw new Error(`Image is still too large (${sizeMB.toFixed(2)}MB) after compression. Maximum size allowed is 5MB.`);
        }
      } catch (sizeCheckError) {
        if (sizeCheckError.message.includes("too large")) {
          throw sizeCheckError; // Rethrow size-specific errors
        }
        console.warn("Size check failed, continuing anyway:", sizeCheckError);
      }
      
      imageUrl = compressedImageUrl;
    } catch (compressionError) {
      console.warn("Image compression failed, proceeding with original:", compressionError);
      
      // If compression failed due to size, we must stop here
      if (compressionError.message.includes("too large")) {
        toast({
          title: "Image too large",
          description: compressionError.message,
          variant: "destructive",
        });
        throw compressionError;
      }
      // Otherwise continue with the original URL - compression is optional
    }
    
    // Call the Claude AI analysis API
    const analyzeData = await callClaudeAnalysisAPI(imageUrl);
    
    // Process the response from Claude
    return processClaudeResponse(analyzeData);
    
  } catch (analyzeError: any) {
    console.error("Error in Claude AI analysis process:", analyzeError);
    const errorMsg = handleAnalysisError(analyzeError);
    throw new Error(errorMsg);
  }
}
