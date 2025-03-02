
import { toast } from "@/hooks/use-toast";
import { processWithClaudeAI } from "@/services/claudeAnalysisService";
import { parseClaudeResponseData } from "@/utils/upload/claudeResponseParser";

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
      return parseClaudeResponseData(data);
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
    return await processWithClaudeAI(imageUrl);
  } catch (claudeError: any) {
    console.error("Claude API error:", claudeError);
    throw new Error(`Claude AI analysis failed: ${claudeError.message}`);
  }
};
