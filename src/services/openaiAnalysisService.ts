
import { toast } from "@/hooks/use-toast";
import { prepareImageForAnalysis, cleanupUrls } from "./openai/imagePreparation";
import { callOpenAIAnalysisAPI } from "./openai/apiService";
import { processOpenAIResponse } from "./openai/responseProcessor";
import { handleAnalysisError } from "@/utils/upload/errorHandler";

/**
 * Process to analyze an image with OpenAI
 */
export async function processWithOpenAI(imageUrl: string) {
  try {
    console.log("Starting OpenAI analysis process for image:", imageUrl.substring(0, 50) + "...");
    
    // Prepare the image
    const processedImageUrl = await prepareImageForAnalysis(imageUrl);
    
    console.log("Prepared image URL for OpenAI:", processedImageUrl.substring(0, 50) + "...");
    console.log("Calling OpenAI analysis API");
    
    // Call the OpenAI analysis API
    const analysisData = await callOpenAIAnalysisAPI(processedImageUrl);
    
    if (!analysisData) {
      console.error("No analysis data returned from OpenAI");
      throw new Error("No analysis data returned from OpenAI");
    }
    
    console.log("OpenAI analysis data received, processing response");
    
    // Process the response
    const result = processOpenAIResponse(analysisData);
    
    console.log("OpenAI analysis complete, cleaning up resources");
    
    // Clean up resources
    cleanupUrls(imageUrl);
    
    return result;
    
  } catch (analyzeError: any) {
    console.error("Error in OpenAI analysis process:", analyzeError);
    
    // Clean up resources
    cleanupUrls(imageUrl);
    
    // Get error message from handler
    const errorMessage = handleAnalysisError(analyzeError);
    
    toast({
      title: "OpenAI Analysis Failed",
      description: errorMessage,
      variant: "destructive",
    });
    
    throw new Error(errorMessage);
  }
}
