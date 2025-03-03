
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

/**
 * Simplified OpenAI analysis API call
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
      throw analyzeError;
    }
    
    console.log("Analysis results received successfully");
    
    if (!analyzeData) {
      throw new Error("Empty response from OpenAI API");
    }
    
    return analyzeData;
  } catch (error: any) {
    console.error("Error in OpenAI analysis:", error);
    const errorMessage = error.message || "Unknown error";
    throw new Error(`OpenAI analysis failed: ${errorMessage}`);
  }
}
