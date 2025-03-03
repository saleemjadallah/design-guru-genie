
import { toast } from "@/hooks/use-toast";
import { handleAnalysisError } from "@/utils/upload/errorHandler";
import { compressImageForAPI } from "@/utils/upload/imageCompressionService";
import type { CompressionOptions } from "@/utils/upload/compression-types";
import { callClaudeAnalysisAPI, processClaudeResponse } from "./claudeApiService";

/**
 * Validates image size and optimizes for Claude AI analysis
 * @param imageUrl URL to verify
 * @returns Promise resolving to compressed image URL
 */
async function prepareImageForClaudeAnalysis(imageUrl: string, compressionOptions: CompressionOptions = {}) {
  try {
    console.log("Preparing image for Claude analysis...");
    
    // Use specific settings optimized for Claude's vision model
    const mergedOptions = {
      maxWidth: compressionOptions.maxWidth || 1200,  // Good balance for detail and size
      maxHeight: compressionOptions.maxHeight || 1600, // Increased for detail
      quality: compressionOptions.quality || 0.8,     // Higher quality for better analysis
      maxSizeBytes: 4.5 * 1024 * 1024, // Claude has a 5MB limit
      forceJpeg: true, // Best compatibility with Claude
      detectTransparency: true, // Important for Claude which handles transparency poorly
      preserveDetails: true // Better quality results
    };
    
    console.log(`Using Claude-optimized compression settings: ${JSON.stringify(mergedOptions)}`);
    
    // Compress image with Claude-specific settings
    const compressedImageUrl = await compressImageForAPI(imageUrl, mergedOptions);
    
    console.log("Image prepared successfully for Claude analysis");
    return compressedImageUrl;
  } catch (compressionError: any) {
    console.warn("Image preparation for Claude failed:", compressionError);
    
    if (compressionError.message && compressionError.message.includes("too large")) {
      toast({
        title: "Image too large",
        description: "Your image exceeds Claude's size limit even after compression. Please try a smaller image.",
        variant: "destructive",
      });
      throw compressionError;
    }
    
    if (compressionError.message && (
        compressionError.message.includes("transparency") || 
        compressionError.message.includes("alpha"))) {
      toast({
        title: "Transparency issue",
        description: "Your image contains transparency which may cause issues with Claude analysis. Converting to JPEG format.",
        variant: "destructive",  // Changed from "warning" to "destructive" as "warning" is not a valid variant
      });
    }
    
    // Try to continue with original image if compression fails
    return imageUrl;
  }
}

/**
 * Main function to process an image with Claude AI analysis
 * Handles preprocessing, API calls, and error handling
 */
export async function processWithClaudeAI(imageUrl: string, compressionOptions: CompressionOptions = {}) {
  try {
    // Prepare image with Claude-specific optimization
    const processedImageUrl = await prepareImageForClaudeAnalysis(imageUrl, compressionOptions);
    
    // Call the Claude AI analysis API
    const analyzeData = await callClaudeAnalysisAPI(processedImageUrl);
    
    // Process the response from Claude
    const result = processClaudeResponse(analyzeData);
    
    return result;
  } catch (analyzeError: any) {
    console.error("Error in Claude AI analysis process:", analyzeError);
    
    const errorMsg = handleAnalysisError(analyzeError);
    
    toast({
      title: "Analysis Failed",
      description: errorMsg,
      variant: "destructive",
    });
    
    throw new Error(errorMsg);
  }
}
