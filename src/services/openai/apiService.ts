
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

/**
 * Call Claude AI analysis API with improved error handling
 */
export async function callOpenAIAnalysisAPI(imageUrl: string) {
  toast({
    title: "AI Analysis",
    description: "Our AI is analyzing your design...",
  });
  
  console.log("Calling analyze-design function (Claude AI)");
  
  try {
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
      
      if (analyzeError.message?.includes("non-2xx status code")) {
        // This is likely due to an issue with how the edge function accesses the API key
        throw new Error("Claude API key access issue. Please verify the ANTHROPIC_API_KEY secret in Edge Function settings.");
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
    }
    
    throw new Error(`Claude AI analysis failed: ${errorMessage}`);
  }
}
