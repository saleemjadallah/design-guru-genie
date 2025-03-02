
import { toast } from "@/hooks/use-toast";
import { processWithClaudeAI } from "@/services/claudeAnalysisService";
import { parseClaudeResponseData } from "@/utils/upload/claudeResponseParser";
import { handleUrlAnalysisError, handleUrlAnalysisSuccess } from "@/utils/upload/urlAnalysisErrorHandler";

/**
 * Process data or get new analysis from Claude API
 * @param imageUrl URL of the screenshot or website
 * @param data Optional pre-existing data
 * @returns Analysis results in the required format
 */
export const processUrlAnalysisData = async (imageUrl: string, data?: any) => {
  // Store original URL for cleanup later
  const originalUrl = imageUrl;
  
  // Check image URL before proceeding
  if (!imageUrl) {
    toast({
      title: "Error",
      description: "No image URL provided for analysis",
      variant: "destructive",
    });
    throw new Error("No image URL provided for analysis");
  }
  
  // If data is provided, try to use it
  if (data) {
    console.log("Processing provided analysis data");
    try {
      const parsedData = parseClaudeResponseData(data);
      if (parsedData.length > 0) {
        handleUrlAnalysisSuccess(parsedData.length);
        return parsedData;
      }
      // If no valid results after parsing, continue to process with Claude API
      toast({
        title: "Retrying analysis",
        description: "Processing your URL with our design analysis AI...",
      });
    } catch (parseError) {
      console.error("Error parsing provided data:", parseError);
      // Continue to process with Claude API
      toast({
        title: "Retrying analysis",
        description: "Processing your URL with our design analysis AI...",
      });
    }
  }

  try {
    // If no usable data provided or parsing failed, use Claude API
    console.log(data ? "Falling back to Claude AI" : "Using Claude AI directly");
    
    // Use more aggressive compression options
    const compressionOptions = {
      maxWidth: 800,
      maxHeight: 1000,
      quality: 0.65,
      maxSizeBytes: 4 * 1024 * 1024 // 4MB target (safely under 5MB)
    };
    
    const results = await processWithClaudeAI(imageUrl, compressionOptions);
    if (results && Array.isArray(results) && results.length > 0) {
      handleUrlAnalysisSuccess(results.length);
    }
    return results;
  } catch (claudeError: any) {
    console.error("Claude API error:", claudeError);
    const errorMessage = handleUrlAnalysisError(claudeError);
    throw new Error(errorMessage);
  } finally {
    // Ensure blob URLs are properly revoked to prevent memory leaks
    if (originalUrl.startsWith('blob:')) {
      console.log("Revoking blob URL in URL analysis service");
      URL.revokeObjectURL(originalUrl);
    }
  }
};
