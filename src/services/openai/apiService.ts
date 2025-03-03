
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
        // This is likely due to an issue with the OpenAI API key or the edge function
        throw new Error("The OpenAI API key may not be properly configured. Please check that the edge function is using the correct OPENAI_API_KEY secret.");
      }
      
      throw analyzeError;
    }
    
    if (!analyzeData) {
      console.error("Empty response from OpenAI API");
      throw new Error("Empty response from OpenAI API. The service may be temporarily unavailable.");
    }
    
    console.log("Analysis results received successfully");
    return analyzeData;
    
  } catch (error: any) {
    console.error("Error in OpenAI analysis:", error);
    const errorMessage = error.message || "Unknown error";
    throw new Error(`OpenAI analysis failed: ${errorMessage}`);
  }
}
