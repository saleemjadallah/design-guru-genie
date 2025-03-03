
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

/**
 * Call OpenAI analysis API with improved error handling and retries
 */
export async function callOpenAIAnalysisAPI(imageUrl: string) {
  toast({
    title: "AI Analysis",
    description: "Our backup AI service is analyzing your design...",
  });
  
  console.log("Calling analyze-design-openai function");
  
  // Configure retry parameters
  const maxRetries = 3;
  const initialBackoff = 1000; // Start with 1-second delay
  
  let lastError = null;
  
  // Retry loop
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${maxRetries} to call OpenAI API`);
      
      // Log function name for debugging
      console.log("Invoking Supabase Edge Function: 'analyze-design-openai'");
      
      const { data: analyzeData, error: analyzeError } = await supabase.functions
        .invoke('analyze-design-openai', {
          body: { 
            imageUrl,
            options: {
              temperature: 0.1,
              maxTokens: 2000
            }
          },
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
      if (analyzeError) {
        console.error(`OpenAI analysis error (attempt ${attempt}/${maxRetries}):`, analyzeError);
        lastError = analyzeError;
        
        // Check for function invocation errors
        if (analyzeError.message?.includes("Failed to send a request to the Edge Function")) {
          console.error("Edge Function invocation failed. This could be due to an incorrectly deployed function.");
          throw new Error("Failed to call the analyze-design-openai Edge Function. Please check that the function is deployed correctly.");
        }
        
        // Throw to trigger retry
        throw analyzeError;
      }
      
      if (!analyzeData) {
        console.error(`Empty response from OpenAI API (attempt ${attempt}/${maxRetries})`);
        lastError = new Error("Empty response from OpenAI API. The service may be temporarily unavailable.");
        throw lastError;
      }
      
      console.log("OpenAI analysis results received successfully");
      return analyzeData;
      
    } catch (error: any) {
      console.error(`Error in OpenAI analysis (attempt ${attempt}/${maxRetries}):`, error);
      lastError = error;
      
      // If this was the last attempt, don't wait, just throw
      if (attempt === maxRetries) {
        console.error(`All ${maxRetries} OpenAI analysis attempts failed. Last error:`, error);
        throw new Error(`OpenAI analysis failed after ${maxRetries} retries: ${error.message}`);
      }
      
      // Calculate exponential backoff with jitter
      const backoff = initialBackoff * Math.pow(2, attempt - 1) * (1 + 0.2 * Math.random());
      console.log(`Retry ${attempt}/${maxRetries} after ${Math.round(backoff)}ms delay`);
      
      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, backoff));
    }
  }
  
  // This should never be reached due to the throw in the last attempt,
  // but TypeScript might complain without it
  throw lastError;
}
