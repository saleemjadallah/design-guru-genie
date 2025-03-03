
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

/**
 * Call OpenAI analysis API with improved error handling
 */
export async function callOpenAIAnalysisAPI(imageUrl: string) {
  toast({
    title: "AI Analysis",
    description: "Our AI is analyzing your design...",
  });
  
  console.log("Calling analyze-design-openai function");
  
  try {
    const { data: analyzeData, error: analyzeError } = await supabase.functions
      .invoke('analyze-design-openai', {
        body: { 
          imageUrl,
          options: {
            model: "gpt-4o",
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
      console.error("OpenAI analysis error:", analyzeError);
      
      if (analyzeError.message?.includes("non-2xx status code")) {
        // This is likely due to an issue with how the edge function accesses the API key
        throw new Error("OpenAI API key access issue. Please verify the OPENAI_API_KEY secret in Edge Function settings.");
      }
      
      throw analyzeError;
    }
    
    if (!analyzeData) {
      console.error("Empty response from OpenAI API");
      throw new Error("Empty response from OpenAI API. The service may be temporarily unavailable.");
    }
    
    console.log("Analysis results received successfully:", analyzeData);
    return analyzeData;
    
  } catch (error: any) {
    console.error("Error in OpenAI analysis:", error);
    
    const errorMessage = error.message || "Unknown error";
    
    // Add more specific error handling based on the error message
    if (errorMessage.includes("invalid or has expired")) {
      throw new Error("The OpenAI API key appears to be invalid or has expired. Please update it in the Edge Function secrets.");
    } else if (errorMessage.includes("rate limit")) {
      throw new Error("OpenAI API rate limit exceeded. Please try again later.");
    } else if (errorMessage.includes("not set or not accessible")) {
      throw new Error("The OPENAI_API_KEY is not accessible by the Edge Function. Please check the exact name and value in Edge Function secrets.");
    }
    
    throw new Error(`OpenAI analysis failed: ${errorMessage}`);
  }
}
