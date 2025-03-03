
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
      
      // Log more detailed error information to help with debugging
      if (typeof analyzeError === 'object') {
        console.error("Error type:", analyzeError.constructor.name);
        console.error("Error properties:", Object.keys(analyzeError));
        
        if (analyzeError.message) {
          console.error("Error message:", analyzeError.message);
        }
        
        if (analyzeError.stack) {
          console.error("Error stack:", analyzeError.stack);
        }
      }
      
      // Check for function invocation errors
      if (analyzeError.message?.includes("Failed to send a request to the Edge Function")) {
        console.error("Edge Function invocation failed. This could be due to an incorrectly deployed function.");
        throw new Error("Failed to call the analyze-design Edge Function. Please check that the function is deployed correctly.");
      }
      
      throw analyzeError;
    }
    
    if (!analyzeData) {
      console.error("Empty response from Claude AI API");
      throw new Error("Empty response from Claude AI API. The service may be temporarily unavailable.");
    }
    
    console.log("Analysis results received successfully");
    return analyzeData;
    
  } catch (error: any) {
    console.error("Error in Claude AI analysis:", error);
    
    const errorMessage = error.message || "Unknown error";
    console.error("Error message details:", errorMessage);
    
    // We now have a hardcoded key, so this error is less likely
    if (errorMessage.includes("invalid or has expired")) {
      throw new Error("The Claude API key appears to be invalid or has expired. Please try again later.");
    } else if (errorMessage.includes("rate limit")) {
      throw new Error("Claude API rate limit exceeded. Please try again later.");
    }
    
    throw new Error(`Claude AI analysis failed: ${errorMessage}`);
  }
}
