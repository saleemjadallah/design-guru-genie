
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
      imageUrl = compressedImageUrl;
    } catch (compressionError) {
      console.warn("Image compression failed, proceeding with original:", compressionError);
      // Continue with the original URL - compression is optional
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
