
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { handleAnalysisError } from "@/utils/upload/errorHandler";

export async function processWithClaudeAI(imageUrl: string) {
  try {
    toast({
      title: "AI Analysis",
      description: "Our AI is analyzing your design for strengths and improvement opportunities...",
    });
    
    console.log("Sending to analyze-design with URL:", imageUrl);
    
    const { data: analyzeData, error: analyzeError } = await supabase.functions
      .invoke('analyze-design', {
        body: { imageUrl },
      });
      
    if (analyzeError) {
      console.error("Claude analysis error:", analyzeError);
      const errorMsg = handleAnalysisError(analyzeError);
      throw new Error(errorMsg);
    }
    
    console.log("Analysis results received:", analyzeData);
    
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
                description: strength.description,
                location: strength.location || null
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
                location: issue.location || null,
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
          console.log("Raw response text:", content.text);
          throw new Error("Failed to parse Claude AI response. Please try again.");
        }
      } else if (analyzeData.result) {
        // Direct JSON response from Claude without content wrapper
        try {
          const formattedFeedback = [];
          
          // Add strengths as positive feedback
          if (analyzeData.result.strengths) {
            analyzeData.result.strengths.forEach((strength: any, index: number) => {
              formattedFeedback.push({
                id: index + 1,
                type: "positive",
                title: strength.title,
                description: strength.description,
                location: strength.location || null
              });
            });
          }
          
          // Add issues as improvement feedback
          if (analyzeData.result.issues) {
            analyzeData.result.issues.forEach((issue: any, index: number) => {
              formattedFeedback.push({
                id: formattedFeedback.length + 1,
                type: "improvement",
                title: issue.issue,
                priority: issue.priority,
                description: issue.recommendation,
                location: issue.location || null,
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
        } catch (error) {
          console.error("Error processing direct response:", error);
          console.log("Raw response data:", analyzeData.result);
          throw new Error("Failed to process analysis results. Please try again.");
        }
      }
    }
    
    throw new Error("Invalid response from Claude AI service");
  } catch (analyzeError: any) {
    console.error("Error calling analyze-design function:", analyzeError);
    toast({
      title: "Analysis failed",
      description: analyzeError.message || "AI analysis failed. Please try again.",
      variant: "destructive",
    });
    throw new Error(`AI analysis failed: ${analyzeError.message || "Unknown error"}`);
  }
}
