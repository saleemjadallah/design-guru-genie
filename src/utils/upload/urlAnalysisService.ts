
import { toast } from "@/hooks/use-toast";
import { processWithClaudeAI } from "@/services/claudeAnalysisService";
import { processWithOpenAI } from "@/services/openaiAnalysisService";

/**
 * URL analysis service using Claude AI for design evaluation,
 * with OpenAI fallback
 */
export const processUrlAnalysisData = async (imageUrl: string, data?: any) => {
  if (!imageUrl) {
    toast({
      title: "Error",
      description: "No image URL provided for analysis",
      variant: "destructive",
    });
    throw new Error("No image URL provided for analysis");
  }
  
  // If data is provided, use it
  if (data && Array.isArray(data) && data.length > 0) {
    console.log("Using provided analysis data");
    toast({
      title: "Analysis complete",
      description: `Analysis found ${data.length} design insights.`,
    });
    return data;
  }

  try {
    // Try Claude AI for analysis first
    console.log("Using Claude AI for URL analysis");
    
    try {
      const results = await processWithClaudeAI(imageUrl);
      
      if (results && Array.isArray(results) && results.length > 0) {
        toast({
          title: "Analysis complete",
          description: `Analysis found ${results.length} design insights.`,
        });
        return results;
      }
    } catch (claudeError) {
      console.warn("Claude AI failed, falling back to OpenAI:", claudeError);
      
      toast({
        title: "Switching AI services",
        description: "Primary AI service unavailable, using backup service...",
      });
      
      // Try OpenAI as fallback
      const openAIResults = await processWithOpenAI(imageUrl);
      
      if (openAIResults && Array.isArray(openAIResults) && openAIResults.length > 0) {
        toast({
          title: "Analysis complete",
          description: `Analysis found ${openAIResults.length} design insights.`,
        });
        return openAIResults;
      }
      
      throw new Error("All AI analysis services failed to produce valid results");
    }
    
    throw new Error("Analysis failed to produce valid results");
  } catch (error: any) {
    console.error("URL analysis error:", error);
    toast({
      title: "URL analysis failed",
      description: error.message || "There was an error analyzing the URL.",
      variant: "destructive"
    });
    throw new Error(error.message || "URL analysis failed");
  } finally {
    // Clean up blob URLs
    if (imageUrl.startsWith('blob:')) {
      console.log("Revoking blob URL in URL analysis service");
      URL.revokeObjectURL(imageUrl);
    }
  }
};
