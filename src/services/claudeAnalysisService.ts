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
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        imageUrl = await uploadBlobToSupabase(blob); // Pass the blob directly
      } catch (error) {
        console.error("Failed to fetch blob URL:", error);
        throw new Error("Could not process local image data");
      }
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
    
    // Add a final explicit size check before calling the Claude API
    try {
      const finalResponse = await fetch(imageUrl);
      const finalBlob = await finalResponse.blob();
      if (finalBlob.size > 5 * 1024 * 1024) {
        throw new Error(`Failed to compress image below 5MB limit. Final size: ${(finalBlob.size / (1024 * 1024)).toFixed(2)}MB`);
      }
    } catch (finalCheckError) {
      console.error("Final size check error:", finalCheckError);
      if (finalCheckError.message.includes("5MB limit")) {
        toast({
          title: "Image too large",
          description: finalCheckError.message,
          variant: "destructive",
        });
        throw finalCheckError;
      }
      // If it's just a fetch error but not a size error, continue
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
