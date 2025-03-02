
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
  
  console.log("Calling analyze-design function with URL type:", 
              imageUrl.startsWith('data:') ? 'data URL' : 
              imageUrl.startsWith('blob:') ? 'blob URL' : 'remote URL');
  
  // Additional debug logging for URL type
  if (imageUrl.startsWith('data:')) {
    console.log("Data URL format:", imageUrl.substring(0, 30) + "...");
    // Verify that the data URL is a supported format
    if (!imageUrl.startsWith('data:image/jpeg') && 
        !imageUrl.startsWith('data:image/png')) {
      console.warn("Using non-standard data URL format for Claude");
    }
  } else {
    console.log("Using remote URL for analysis:", imageUrl);
  }
  
  // Add retry mechanism with exponential backoff
  const maxRetries = 2;
  let retryCount = 0;
  let lastError = null;
  
  while (retryCount <= maxRetries) {
    try {
      // Proceed with Claude analysis with more explicit options
      console.log(`Attempt ${retryCount + 1}/${maxRetries + 1} to call Claude API`);
      
      const { data: analyzeData, error: analyzeError } = await supabase.functions
        .invoke('analyze-design', {
          body: { 
            imageUrl,
            options: {
              maxTokens: 1200,     // Reduced token usage to prevent timeouts
              temperature: 0.1,    // Lower temperature for more consistent results
              compressImage: true,  // Tell Edge function to compress image as well
              format: "json",      // Explicitly request JSON format
              timeout: 60000,      // 60 second timeout
              forceJpeg: true      // Tell edge function to force JPEG conversion
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
      
      console.log("Analysis results received, type:", typeof analyzeData);
      
      // Verify we actually got a response with content
      if (!analyzeData) {
        throw new Error("Empty response from Claude API");
      }
      
      // Log first bit of response for debugging
      console.log("Analysis response sample:", 
        typeof analyzeData === 'object' 
          ? JSON.stringify(analyzeData).substring(0, 100) + "..." 
          : analyzeData.toString().substring(0, 100) + "..."
      );
      
      return analyzeData;
    } catch (error) {
      lastError = error;
      retryCount++;
      
      console.error(`Attempt ${retryCount}/${maxRetries + 1} failed:`, error);
      
      if (retryCount <= maxRetries) {
        const backoffDelay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        console.log(`Retry ${retryCount}/${maxRetries} after ${backoffDelay}ms delay`);
        
        toast({
          title: `Retry ${retryCount}/${maxRetries}`,
          description: "The AI service is taking longer than expected. Retrying...",
        });
        
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }
    }
  }
  
  // If we get here, all retries failed
  console.error("All retries failed. Last error:", lastError);
  throw lastError;
}

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
