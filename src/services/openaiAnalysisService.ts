
import { handleAnalysisError } from "@/utils/upload/errorHandler";
import { CompressionOptions } from "./openai/types";
import { prepareImageForAnalysis, cleanupUrls } from "./openai/imagePreparation";
import { callOpenAIAnalysisAPI } from "./openai/apiService";
import { processOpenAIResponse } from "./openai/responseProcessor";

/**
 * Main function to process an image with OpenAI analysis
 * Handles preprocessing, API calls, and error handling
 */
export async function processWithOpenAI(imageUrl: string, compressionOptions: CompressionOptions = {}) {
  // Store original URL for cleanup later
  const originalUrl = imageUrl;
  
  try {
    // Prepare image (compress, validate size)
    const processedImageUrl = await prepareImageForAnalysis(imageUrl, compressionOptions);
    
    // Call the OpenAI analysis API through Supabase Edge Function
    const analysisData = await callOpenAIAnalysisAPI(processedImageUrl);
    
    // Process the response
    const result = processOpenAIResponse(analysisData);
    
    // Clean up resources
    cleanupUrls(originalUrl, processedImageUrl);
    
    return result;
    
  } catch (analyzeError: any) {
    console.error("Error in OpenAI analysis process:", analyzeError);
    
    // Clean up resources even when there's an error
    cleanupUrls(originalUrl, imageUrl);
    
    const errorMsg = handleAnalysisError(analyzeError);
    throw new Error(errorMsg);
  }
}
