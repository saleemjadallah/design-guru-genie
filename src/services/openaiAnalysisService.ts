
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
    
    // Improve error messages for API key configuration issues
    let errorMessage = analyzeError.message || "There was an error analyzing your design.";
    
    if (errorMessage.includes("ANTHROPIC_API_KEY")) {
      errorMessage = "API key configuration issue: Please make sure the ANTHROPIC_API_KEY is correctly set with the EXACT name in Edge Function secrets.";
    } else if (errorMessage.includes("Claude API key")) {
      errorMessage = "There's an issue with the Claude API key. Please check that ANTHROPIC_API_KEY is correctly set in the Edge Function secrets.";
    }
    
    toast({
      title: "Analysis Failed",
      description: errorMessage,
      variant: "destructive",
    });
    
    throw new Error(errorMessage);
  }
}
