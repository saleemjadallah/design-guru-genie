
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

/**
 * Call Claude AI analysis API with improved error handling and debugging
 */
export async function callOpenAIAnalysisAPI(imageUrl: string) {
  toast({
    title: "AI Analysis",
    description: "Our AI is analyzing your design...",
  });
  
  console.log("Calling analyze-design function (Claude AI)");
  
  try {
    // Log function name for debugging
    console.log("Invoking Supabase Edge Function: 'analyze-design'");
    
    const { data: analyzeData, error: analyzeError } = await supabase.functions
      .invoke('analyze-design', {
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
      console.error("Claude AI analysis error:", analyzeError);
      
      // Check for function invocation errors
      if (analyzeError.message?.includes("Failed to send a request to the Edge Function")) {
        console.error("Edge Function invocation failed. This could be due to an incorrectly deployed function.");
        throw new Error("Failed to call the analyze-design Edge Function. Please check that the function is deployed correctly.");
      }
      
      if (analyzeError.message?.includes("non-2xx status code")) {
        // This is likely due to an issue with how the edge function accesses the API key
        throw new Error("Claude API key access issue in Edge Function. Please verify the ANTHROPIC_API_KEY secret is correctly set in Edge Function settings and the edge function is using it properly.");
      }
      
      throw analyzeError;
    }
    
    if (!analyzeData) {
      console.error("Empty response from Claude AI API");
      throw new Error("Empty response from Claude AI API. The service may be temporarily unavailable.");
    }
    
    console.log("Analysis results received successfully:", analyzeData);
    return analyzeData;
    
  } catch (error: any) {
    console.error("Error in Claude AI analysis:", error);
    
    const errorMessage = error.message || "Unknown error";
    
    // Add more specific error handling based on the error message
    if (errorMessage.includes("invalid or has expired")) {
      throw new Error("The Claude API key appears to be invalid or has expired. Please update it in the Edge Function secrets.");
    } else if (errorMessage.includes("rate limit")) {
      throw new Error("Claude API rate limit exceeded. Please try again later.");
    } else if (errorMessage.includes("not set or not accessible")) {
      throw new Error("The ANTHROPIC_API_KEY is not accessible by the Edge Function. Please check the exact name and value in Edge Function secrets.");
    } else if (errorMessage.includes("ANTHROPIC_API_KEY")) {
      throw new Error("ANTHROPIC_API_KEY issue in edge function. Please verify it's set with the correct EXACT name 'ANTHROPIC_API_KEY' (case sensitive) in Edge Function secrets.");
    }
    
    throw new Error(`Claude AI analysis failed: ${errorMessage}`);
  }
}
