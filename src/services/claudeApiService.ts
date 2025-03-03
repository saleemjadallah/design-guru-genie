
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { parseClaudeResponseData } from "@/utils/upload/claudeResponseParser";

/**
 * Makes a request to the Claude AI analysis endpoint through Supabase Edge Functions
 * @param imageUrl URL of the image to analyze
 * @param timeoutMs Optional timeout in milliseconds (default: 90000ms - 90 seconds)
 */
export async function callClaudeAnalysisAPI(imageUrl: string, timeoutMs: number = 120000) { // Extended timeout to 120 seconds
  toast({
    title: "AI Analysis",
    description: "Our AI is analyzing your design for strengths and improvement opportunities...",
  });
  
  console.log(`Calling analyze-design function with timeout: ${timeoutMs}ms`);
  console.log(`Image URL type: ${imageUrl.startsWith('data:') ? 'data URL' : 'remote URL'}`);
  
  // Improved retry mechanism with better backoff strategy
  const maxRetries = 3; // Increased from 2 to 3
  let retryCount = 0;
  let lastError = null;
  
  // Track start time for better timeout management
  const startTime = Date.now();
  
  while (retryCount <= maxRetries) {
    try {
      // Calculate remaining time for this attempt
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(timeoutMs - elapsedTime, 20000); // Ensure at least 20s
      
      console.log(`Attempt ${retryCount + 1}/${maxRetries + 1} to call Claude API (${remainingTime}ms remaining)`);
      
      // Show detailed progress toast for better UX during long operations
      if (retryCount > 0) {
        toast({
          title: `AI Analysis - Attempt ${retryCount + 1}`,
          description: "Processing complex design elements. This may take a moment...",
        });
      }
      
      // Add useful metadata for debugging and better Claude handling
      const requestBody = { 
        imageUrl,
        options: {
          maxTokens: 2000,
          temperature: 0.1,
          isDataUrl: imageUrl.startsWith('data:'),
          isMultiScreenshot: imageUrl.length > 500000 // Useful hint for edge function
        }
      };
      
      console.log("Sending request to Claude API...");
      
      // Create a promise that times out if the edge function takes too long
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Edge function timed out")), remainingTime);
      });
      
      // Wrap the supabase function call in a Promise.race with the timeout
      const functionCallPromise = supabase.functions.invoke('analyze-design', {
        body: requestBody,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const { data: analyzeData, error: analyzeError } = await Promise.race([
        functionCallPromise,
        timeoutPromise.then(() => {
          throw new Error("Edge function timed out");
        })
      ]) as any;
      
      if (analyzeError) {
        console.error("Claude analysis error:", analyzeError);
        
        // Check if the error indicates a timeout
        if (analyzeError.message && analyzeError.message.includes("timeout")) {
          throw new Error("Claude analysis timed out. The design may be too complex.");
        }
        
        throw analyzeError;
      }
      
      console.log("Analysis results received successfully");
      
      // Better debug logging
      console.log("Response type:", typeof analyzeData);
      if (typeof analyzeData === 'object') {
        console.log("Response keys:", Object.keys(analyzeData));
      }
      
      // Verify we actually got a response with expected structure
      if (!analyzeData) {
        throw new Error("Empty response from Claude API");
      }
      
      // Log success with timing information for monitoring
      const totalTime = Date.now() - startTime;
      console.log(`Analysis completed in ${totalTime}ms`);
      
      return analyzeData;
    } catch (error: any) {
      // Check if this was an abort error (timeout)
      if (error.name === "AbortError" || (error.message && error.message.includes("time"))) {
        console.error("Request timed out");
        lastError = new Error(`Claude analysis timed out after ${timeoutMs}ms. The design may be too complex for analysis.`);
      } else {
        lastError = error;
      }
      
      retryCount++;
      
      console.error(`Attempt ${retryCount}/${maxRetries + 1} failed:`, lastError);
      
      if (retryCount <= maxRetries) {
        // Improved exponential backoff with jitter for better retry behavior
        const baseDelay = Math.pow(1.5, retryCount) * 1000;
        const jitter = Math.random() * 1000; // Add up to 1s of jitter
        const backoffDelay = baseDelay + jitter;
        
        console.log(`Retry ${retryCount}/${maxRetries} after ${Math.round(backoffDelay)}ms delay`);
        
        // More informative toast
        toast({
          title: `Retry ${retryCount}/${maxRetries}`,
          description: "The AI service needs more time to analyze your design. Retrying with adjusted settings...",
        });
        
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }
    }
  }
  
  // If we get here, all retries failed
  console.error("All retries failed. Last error:", lastError);
  
  // Provide more context in the error message
  const errorMessage = lastError?.message || "Unknown error";
  throw new Error(`Claude analysis failed after ${maxRetries} retries: ${errorMessage}`);
}

/**
 * Processes the response from Claude API
 * @param analyzeData Raw analysis data from Claude
 * @returns Formatted feedback data
 */
export function processClaudeResponse(analyzeData: any) {
  try {
    return parseClaudeResponseData(analyzeData);
  } catch (error: any) {
    console.error("Error processing Claude response:", error);
    throw new Error(`Failed to process Claude response: ${error.message}`);
  }
}
