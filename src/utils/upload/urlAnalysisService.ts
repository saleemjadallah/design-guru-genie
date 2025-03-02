
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

  // If no usable data provided or parsing failed, use Claude API
  console.log(data ? "Falling back to Claude AI" : "Using Claude AI directly");
  try {
    const results = await processWithClaudeAI(imageUrl);
    if (results && Array.isArray(results) && results.length > 0) {
      handleUrlAnalysisSuccess(results.length);
    }
    return results;
  } catch (claudeError: any) {
    console.error("Claude API error:", claudeError);
    const errorMessage = handleUrlAnalysisError(claudeError);
    throw new Error(errorMessage);
  }
};
