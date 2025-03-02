
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { formatFeedbackFromJsonData } from "@/utils/upload/feedbackFormatter";
import { compressImageForAPI } from "@/utils/upload/imageCompressionService";
import { uploadBlobToSupabase, validateImageUrl } from "@/utils/upload/imageUploadService";

/**
 * Makes a request to the Claude AI analysis endpoint through Supabase Edge Functions
 */
export async function callClaudeAnalysisAPI(imageUrl: string) {
  toast({
    title: "AI Analysis",
    description: "Our AI is analyzing your design for strengths and improvement opportunities...",
  });
  
  console.log("Calling analyze-design function with URL:", imageUrl);
  
  // Proceed with Claude analysis for proper images
  const { data: analyzeData, error: analyzeError } = await supabase.functions
    .invoke('analyze-design', {
      body: { 
        imageUrl,
        options: {
          maxTokens: 1500,     // Limit token usage
          temperature: 0.2,    // Lower temperature for more predictable results
          compressImage: true   // Tell Edge function to compress image as well
        }
      },
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
  if (analyzeError) {
    console.error("Claude analysis error:", analyzeError);
    // Additional detailed logging for Claude errors
    console.error("Claude error details:", JSON.stringify(analyzeError, null, 2));
    throw analyzeError;
  }
  
  console.log("Analysis results received:", analyzeData);
  
  return analyzeData;
}

/**
 * Handles various response formats from Claude API
 */
export function processClaudeResponse(analyzeData: any) {
  // Handle various response formats from Claude
  if (analyzeData && analyzeData.result) {
    // Check for error response
    if (analyzeData.result.type === 'error') {
      console.error("Claude API error:", analyzeData.result.error);
      throw new Error(`Claude API error: ${analyzeData.result.error.message || 'Unknown error'}`);
    }
    
    // Extract content from Claude's response
    if (analyzeData.result.content && Array.isArray(analyzeData.result.content)) {
      try {
        const content = analyzeData.result.content[0];
        if (content && content.type === 'text') {
          const jsonData = JSON.parse(content.text);
          return formatFeedbackFromJsonData(jsonData);
        } else {
          console.error("Unexpected content type or format:", content);
          throw new Error("Unexpected response format from Claude API");
        }
      } catch (parseError) {
        console.error("Error parsing JSON from Claude:", parseError);
        console.log("Raw response text:", analyzeData.result.content[0]?.text);
        throw new Error("Failed to parse Claude AI response. Please try again.");
      }
    } 
    // Direct JSON response from Claude
    else if (typeof analyzeData.result === 'object') {
      try {
        return formatFeedbackFromJsonData(analyzeData.result);
      } catch (error) {
        console.error("Error processing direct response:", error);
        console.log("Raw response data:", analyzeData.result);
        throw new Error("Failed to process analysis results. Please try again.");
      }
    }
  }
  
  // If we get here, there was an unexpected response format
  console.error("Invalid Claude AI response format:", analyzeData);
  throw new Error("Invalid response format from Claude AI service");
}
