
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

/**
 * Makes a request to the OpenAI analysis endpoint through Supabase Edge Functions
 */
export async function callOpenAIAnalysisAPI(imageUrl: string) {
  toast({
    title: "AI Analysis",
    description: "Our AI is analyzing your design for strengths and improvement opportunities...",
  });
  
  console.log("Calling analyze-design-openai function with image URL");
  
  // Add retry mechanism with exponential backoff
  const maxRetries = 2;
  let retryCount = 0;
  let lastError = null;
  
  while (retryCount <= maxRetries) {
    try {
      console.log(`Attempt ${retryCount + 1}/${maxRetries + 1} to call OpenAI API`);
      
      const { data: analyzeData, error: analyzeError } = await supabase.functions
        .invoke('analyze-design-openai', {
          body: { 
            imageUrl,
            options: {
              model: "gpt-4o", // Use GPT-4o for best vision analysis
              temperature: 0.1, // Lower temperature for more consistent results
              maxTokens: 1500,  // Enough tokens for detailed analysis
            }
          },
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
      if (analyzeError) {
        console.error("OpenAI analysis error:", analyzeError);
        throw analyzeError;
      }
      
      console.log("Analysis results received");
      
      // Verify we actually got a response
      if (!analyzeData) {
        throw new Error("Empty response from OpenAI API");
      }
      
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
