
import { toast } from "@/hooks/use-toast";
import { processWithOpenAI } from "@/services/openaiAnalysisService";

/**
 * Simplified URL analysis service using Claude AI
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
    // Use Claude AI for analysis (same function name as before)
    console.log("Using Claude AI for URL analysis");
    const results = await processWithOpenAI(imageUrl);
    
    if (results && Array.isArray(results) && results.length > 0) {
      toast({
        title: "Analysis complete",
        description: `Analysis found ${results.length} design insights.`,
      });
    }
    
    return results;
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
