
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

/**
 * Makes a request to the OpenAI analysis endpoint through Supabase Edge Functions
 */
/**
 * Calls the OpenAI analysis API with improved timeout and retry handling
 * @param imageUrl URL of the image to analyze
 * @param timeoutMs Optional timeout in milliseconds (default: 90000ms - 90 seconds)
 */
export async function callOpenAIAnalysisAPI(imageUrl: string, timeoutMs: number = 90000) {
  toast({
    title: "AI Analysis",
    description: "Our AI is analyzing your design for strengths and improvement opportunities...",
  });
  
  console.log(`Calling analyze-design-openai function with timeout: ${timeoutMs}ms`);
  
  // Improved retry mechanism with better backoff strategy
  const maxRetries = 3; // Increased from 2
  let retryCount = 0;
  let lastError = null;
  
  // Track start time for better timeout management
  const startTime = Date.now();
  
  while (retryCount <= maxRetries) {
    // Create an AbortController for timeout management
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    try {
      // Calculate remaining time for this attempt
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(timeoutMs - elapsedTime, 10000); // Ensure at least 10s
      
      console.log(`Attempt ${retryCount + 1}/${maxRetries + 1} to call OpenAI API (${remainingTime}ms remaining)`);
      
      // Show detailed progress toast for better UX during long operations
      if (retryCount > 0) {
        toast({
          title: `AI Analysis - Attempt ${retryCount + 1}`,
          description: "Processing complex design elements. This may take a moment...",
        });
      }
      
      const { data: analyzeData, error: analyzeError } = await supabase.functions
        .invoke('analyze-design-openai', {
          body: { 
            imageUrl,
            options: {
              model: "gpt-4o", // Use GPT-4o for best vision analysis
              temperature: 0.1, // Lower temperature for more consistent results
              maxTokens: 2000,  // Increased from 1500 for more detailed analysis
              timeout: remainingTime, // Pass timeout to Edge Function
              apiVersion: "v1" // Specify API version for compatibility
            }
          },
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
          // Removed 'signal: controller.signal' as it's not supported in FunctionInvokeOptions
        });
      
      // Clear the timeout since the request completed
      clearTimeout(timeoutId);
        
      if (analyzeError) {
        console.error("OpenAI analysis error:", analyzeError);
        
        // Check if the error indicates a timeout
        if (analyzeError.message && analyzeError.message.includes("timeout")) {
          throw new Error("OpenAI analysis timed out. The design may be too complex.");
        }
        
        throw analyzeError;
      }
      
      console.log("Analysis results received successfully");
      
      // Verify we actually got a response with expected structure
      if (!analyzeData) {
        throw new Error("Empty response from OpenAI API");
      }
      
      // Log success with timing information for monitoring
      const totalTime = Date.now() - startTime;
      console.log(`Analysis completed in ${totalTime}ms`);
      
      return analyzeData;
    } catch (error: any) {
      // Always clear timeout to prevent memory leaks
      clearTimeout(timeoutId);
      
      // Check if this was an abort error (timeout)
      if (error.name === "AbortError" || (error.message && error.message.includes("aborted"))) {
        console.error("Request aborted due to timeout");
        lastError = new Error(`OpenAI analysis timed out after ${timeoutMs}ms`);
      } else {
        lastError = error;
      }
      
      retryCount++;
      
      console.error(`Attempt ${retryCount}/${maxRetries + 1} failed:`, lastError);
      
      if (retryCount <= maxRetries) {
        // Improved exponential backoff with jitter for better retry behavior
        const baseDelay = Math.pow(1.5, retryCount) * 1000; // Changed from 2^retryCount
        const jitter = Math.random() * 1000; // Add up to 1s of jitter
        const backoffDelay = baseDelay + jitter;
        
        console.log(`Retry ${retryCount}/${maxRetries} after ${Math.round(backoffDelay)}ms delay`);
        
        // More informative toast
        toast({
          title: `Retry ${retryCount}/${maxRetries}`,
          description: "The AI service needs more time to analyze your complex design. Retrying with adjusted settings...",
        });
        
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }
    }
  }
  
  // If we get here, all retries failed
  console.error("All retries failed. Last error:", lastError);
  
  // Provide more context in the error message
  const errorMessage = lastError?.message || "Unknown error";
  throw new Error(`OpenAI analysis failed after ${maxRetries} retries: ${errorMessage}`);
}
