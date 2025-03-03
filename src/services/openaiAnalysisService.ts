
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
    
    console.log("Prepared image URL:", processedImageUrl.substring(0, 50) + "...");
    console.log("Calling Claude analysis API via callOpenAIAnalysisAPI function");
    
    // Call the Claude analysis API (using the same function name)
    const analysisData = await callOpenAIAnalysisAPI(processedImageUrl);
    
    if (!analysisData) {
      console.error("No analysis data returned from Claude AI");
      throw new Error("No analysis data returned from Claude AI");
    }
    
    console.log("Analysis data received, processing response");
    
    // Process the response
    const result = processOpenAIResponse(analysisData);
    
    console.log("Analysis complete, cleaning up resources");
    
    // Clean up resources
    cleanupUrls(imageUrl);
    
    return result;
    
  } catch (analyzeError: any) {
    console.error("Error in Claude AI analysis process:", analyzeError);
    
    // Clean up resources
    cleanupUrls(imageUrl);
    
    // Now using hardcoded API key so these errors should be less common
    let errorMessage = analyzeError.message || "There was an error analyzing your design.";
    
    toast({
      title: "Analysis Failed",
      description: errorMessage,
      variant: "destructive",
    });
    
    throw new Error(errorMessage);
  }
}
