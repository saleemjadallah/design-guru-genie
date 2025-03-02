
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { generateDummyFeedback } from "@/utils/upload/dummyData";
import { handleAnalysisError } from "@/utils/upload/errorHandler";

export async function processWithClaudeAI(publicUrl: string) {
  try {
    toast({
      title: "AI Analysis",
      description: "Our AI is analyzing your design for strengths and improvement opportunities...",
    });
    
    const { data: analyzeData, error: analyzeError } = await supabase.functions
      .invoke('analyze-design', {
        body: { imageUrl: publicUrl },
      });
      
    if (analyzeError) {
      const errorMsg = handleAnalysisError(analyzeError);
      throw new Error(errorMsg);
    }
    
    console.log("Analysis results:", analyzeData);
    
    // Extract the feedback from Claude's response
    if (analyzeData && analyzeData.result && analyzeData.result.content) {
      const content = analyzeData.result.content[0];
      if (content && content.type === 'text') {
        try {
          const jsonData = JSON.parse(content.text);
          
          // Format the data for our feedback system
          const formattedFeedback = [];
          
          // Add strengths as positive feedback
          if (jsonData.strengths) {
            jsonData.strengths.forEach((strength: any, index: number) => {
              formattedFeedback.push({
                id: index + 1,
                type: "positive",
                title: strength.title,
                description: strength.description
              });
            });
          }
          
          // Add issues as improvement feedback
          if (jsonData.issues) {
            jsonData.issues.forEach((issue: any, index: number) => {
              formattedFeedback.push({
                id: formattedFeedback.length + 1,
                type: "improvement",
                title: issue.issue,
                priority: issue.priority,
                description: issue.recommendation,
                location: issue.location,
                principle: issue.principle,
                technical_details: issue.technical_details
              });
            });
          }
          
          toast({
            title: "Analysis successful",
            description: `Found ${formattedFeedback.length} insights about your design.`,
          });
          
          return formattedFeedback;
        } catch (parseError) {
          console.error("Error parsing JSON from Claude:", parseError);
          toast({
            title: "Data format error",
            description: "There was an error processing the AI response. Using alternative analysis.",
            variant: "destructive"
          });
          // Fallback to dummy data if parsing fails
          return generateDummyFeedback();
        }
      }
    }
    
    toast({
      title: "Limited analysis",
      description: "We couldn't get a complete analysis. Using alternative feedback.",
      variant: "destructive"
    });
    return generateDummyFeedback();
  } catch (analyzeError) {
    console.error("Error calling analyze-design function:", analyzeError);
    toast({
      title: "AI service unavailable",
      description: "Our AI analysis service is currently unavailable. Using alternative feedback.",
      variant: "destructive"
    });
    // Fallback to dummy data if analysis fails
    return generateDummyFeedback();
  }
}
