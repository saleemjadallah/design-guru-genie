
import { toast } from "@/hooks/use-toast";
import { handleAnalysisError } from "@/utils/upload/errorHandler";
import { CompressionOptions } from "@/utils/upload/compression-types";
import { validateImageUrl } from "@/utils/upload/imageUploadService";
import { callClaudeAnalysisAPI, processClaudeResponse } from "@/services/claudeApiService";
import { processBlobUrl, cleanupUrls } from "@/utils/upload/urlUtils";
import { prepareImageForAnalysis } from "@/utils/upload/imagePreparation";
import { verifyFinalImageSize } from "@/utils/upload/sizeValidation";

/**
 * Main function to process an image with Claude AI analysis
 * Handles preprocessing, API calls, and error handling
 */
export async function processWithClaudeAI(imageUrl: string, compressionOptions: CompressionOptions = {}) {
  // Store original URL for cleanup later
  const originalUrl = imageUrl;
  
  try {
    // Process blob URLs
    if (imageUrl.startsWith('blob:')) {
      imageUrl = await processBlobUrl(imageUrl);
    }
    
    // Validate the image URL
    validateImageUrl(imageUrl);
    
    // Prepare image (compress, validate size)
    imageUrl = await prepareImageForAnalysis(imageUrl, compressionOptions);
    
    // Final size verification
    await verifyFinalImageSize(imageUrl);
    
    // Call the Claude AI analysis API
    const analyzeData = await callClaudeAnalysisAPI(imageUrl);
    
    // Process the response from Claude
    const result = processClaudeResponse(analyzeData);
    
    // Clean up resources
    cleanupUrls(originalUrl, imageUrl);
    
    return result;
    
  } catch (analyzeError: any) {
    console.error("Error in Claude AI analysis process:", analyzeError);
    
    // Clean up resources even when there's an error
    cleanupUrls(originalUrl, imageUrl);
    
    const errorMsg = handleAnalysisError(analyzeError);
    throw new Error(errorMsg);
  }
}
