
import { toast } from "@/hooks/use-toast";
import { formatFeedbackFromJsonData } from "@/utils/upload/feedbackFormatter";

/**
 * Handles various response formats from Claude API
 */
export function processClaudeResponse(analyzeData: any) {
  console.log("Processing Claude response, data type:", typeof analyzeData);
  
  try {
    // Case 1: Handle various response formats from Claude
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
          console.log("Content type:", content?.type);
          
          if (content && content.type === 'text') {
            // Try to parse as JSON first
            try {
              const jsonData = JSON.parse(content.text);
              console.log("Successfully parsed JSON from Claude response");
              return formatFeedbackFromJsonData(jsonData);
            } catch (jsonParseError) {
              // If JSON parsing fails, log the error and raw text for debugging
              console.error("JSON parse error:", jsonParseError);
              console.log("Raw text from Claude (first 200 chars):", content.text.substring(0, 200));
              
              // Try to extract JSON from the text response (sometimes Claude wraps JSON in markdown)
              const jsonMatch = content.text.match(/```json\s*([\s\S]*?)\s*```/);
              if (jsonMatch && jsonMatch[1]) {
                try {
                  const extractedJson = JSON.parse(jsonMatch[1]);
                  console.log("Successfully extracted JSON from markdown code block");
                  return formatFeedbackFromJsonData(extractedJson);
                } catch (extractError) {
                  console.error("Failed to parse extracted JSON:", extractError);
                }
              }
              
              throw new Error("Failed to parse Claude AI response. The response was not in JSON format.");
            }
          } else {
            console.error("Unexpected content type or format:", content);
            throw new Error("Unexpected response format from Claude API");
          }
        } catch (parseError) {
          console.error("Error parsing response from Claude:", parseError);
          console.log("Raw response content:", JSON.stringify(analyzeData.result.content));
          throw new Error("Failed to parse Claude AI response. Please try again.");
        }
      }
      // Direct JSON response from Claude
      else if (typeof analyzeData.result === 'object') {
        try {
          return formatFeedbackFromJsonData(analyzeData.result);
        } catch (error) {
          console.error("Error processing direct response:", error);
          console.log("Raw response data:", JSON.stringify(analyzeData.result, null, 2).substring(0, 500) + "...");
          throw new Error("Failed to process analysis results. Please try again.");
        }
      }
    }
    // Case 2: Response is already in the expected format
    else if (Array.isArray(analyzeData)) {
      console.log("Response is already an array with", analyzeData.length, "items");
      return analyzeData;
    }
    // Case 3: Direct object that needs formatting
    else if (typeof analyzeData === 'object' && analyzeData !== null) {
      try {
        console.log("Trying to format direct object response");
        return formatFeedbackFromJsonData(analyzeData);
      } catch (error) {
        console.error("Error processing direct object:", error);
        throw new Error("Failed to process object response. Please try again.");
      }
    }
  } catch (error) {
    console.error("Error in processClaudeResponse:", error);
    throw error;
  }
  
  // If we get here, there was an unexpected response format
  console.error("Invalid Claude AI response format:", typeof analyzeData, analyzeData);
  throw new Error("Invalid response format from Claude AI service");
}
