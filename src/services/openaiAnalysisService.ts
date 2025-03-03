
import { toast } from "@/hooks/use-toast";
import { prepareImageForAnalysis, cleanupUrls } from "./openai/imagePreparation";
import { callOpenAIAnalysisAPI } from "./openai/apiService";
import { processOpenAIResponse } from "./openai/responseProcessor";

/**
 * Simplified process to analyze an image with OpenAI
 */
export async function processWithOpenAI(imageUrl: string) {
  try {
    console.log("Starting OpenAI analysis process for image:", imageUrl.substring(0, 50) + "...");
    
    // Simply pass through the image
    const processedImageUrl = await prepareImageForAnalysis(imageUrl);
    
    // Call the OpenAI analysis API
    const analysisData = await callOpenAIAnalysisAPI(processedImageUrl);
    
    if (!analysisData) {
      throw new Error("No analysis data returned from OpenAI");
    }
    
    // Process the response
    const result = processOpenAIResponse(analysisData);
    
    // Clean up resources
    cleanupUrls(imageUrl);
    
    return result;
    
  } catch (analyzeError: any) {
    console.error("Error in OpenAI analysis process:", analyzeError);
    
    // Clean up resources
    cleanupUrls(imageUrl);
    
    toast({
      title: "Analysis Failed",
      description: analyzeError.message || "There was an error analyzing your design.",
      variant: "destructive",
    });
    
    throw new Error(analyzeError.message || "Analysis failed");
  }
}
