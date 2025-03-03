
import { toast } from "@/hooks/use-toast";
import { prepareImageForAnalysis, cleanupUrls } from "./openai/imagePreparation";
import { callOpenAIAnalysisAPI } from "./openai/apiService";
import { processOpenAIResponse } from "./openai/responseProcessor";

/**
 * Simplified process to analyze an image with Claude AI
 * (keeping the same function name to avoid updating all references)
 */
export async function processWithOpenAI(imageUrl: string) {
  try {
    console.log("Starting Claude AI analysis process for image:", imageUrl.substring(0, 50) + "...");
    
    // Simply pass through the image
    const processedImageUrl = await prepareImageForAnalysis(imageUrl);
    
    // Call the Claude analysis API (using the same function name)
    const analysisData = await callOpenAIAnalysisAPI(processedImageUrl);
    
    if (!analysisData) {
      throw new Error("No analysis data returned from Claude AI");
    }
    
    // Process the response
    const result = processOpenAIResponse(analysisData);
    
    // Clean up resources
    cleanupUrls(imageUrl);
    
    return result;
    
  } catch (analyzeError: any) {
    console.error("Error in Claude AI analysis process:", analyzeError);
    
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
