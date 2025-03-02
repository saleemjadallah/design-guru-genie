
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { handleAnalysisError } from "@/utils/upload/errorHandler";
import { generateDummyFeedback } from "@/utils/upload/dummyData";

export async function processWithClaudeAI(imageUrl: string) {
  try {
    toast({
      title: "AI Analysis",
      description: "Our AI is analyzing your design for strengths and improvement opportunities...",
    });
    
    console.log("Sending to analyze-design with URL:", imageUrl);
    
    // Check if the image is an SVG placeholder or data URL
    const isSvgPlaceholder = typeof imageUrl === 'string' && 
      (imageUrl.startsWith('data:image/svg') || imageUrl.includes('<svg'));
    
    if (isSvgPlaceholder) {
      console.log("Detected SVG placeholder instead of actual screenshot");
      toast({
        title: "Limited Analysis",
        description: "We couldn't capture the website screenshot. Using simulated analysis instead.",
        variant: "destructive",
      });
      
      // Return dummy feedback data for SVG placeholders
      return generateDummyFeedback();
    }
    
    // Proceed with Claude analysis for proper images
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
    
    // Handle various response formats from Claude
    if (analyzeData && analyzeData.result) {
      // Check for error response
      if (analyzeData.result.type === 'error') {
        console.error("Claude API error:", analyzeData.result.error);
        throw new Error(`Claude API error: ${analyzeData.result.error.message || 'Unknown error'}`);
      }
      
      // Extract content from Claude's response
      if (analyzeData.result.content && Array.isArray(analyzeData.result.content)) {
        try {
          const content = analyzeData.result.content[0];
          if (content && content.type === 'text') {
            const jsonData = JSON.parse(content.text);
            return formatFeedbackFromJsonData(jsonData);
          }
        } catch (parseError) {
          console.error("Error parsing JSON from Claude:", parseError);
          console.log("Raw response text:", analyzeData.result.content[0]?.text);
          throw new Error("Failed to parse Claude AI response. Please try again.");
        }
      } 
      // Direct JSON response from Claude
      else if (typeof analyzeData.result === 'object') {
        try {
          return formatFeedbackFromJsonData(analyzeData.result);
        } catch (error) {
          console.error("Error processing direct response:", error);
          console.log("Raw response data:", analyzeData.result);
          throw new Error("Failed to process analysis results. Please try again.");
        }
      }
    }
    
    // If we get here, there was an unexpected response format
    console.error("Invalid Claude AI response format:", analyzeData);
    throw new Error("Invalid response format from Claude AI service");
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

// Helper function to format feedback consistently
function formatFeedbackFromJsonData(jsonData: any) {
  const formattedFeedback = [];
  
  // Add strengths as positive feedback
  if (jsonData.strengths && Array.isArray(jsonData.strengths)) {
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
  if (jsonData.issues && Array.isArray(jsonData.issues)) {
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
  
  // Check if we have any feedback items
  if (formattedFeedback.length === 0) {
    console.error("No feedback items found in Claude response:", jsonData);
    throw new Error("No feedback items found in the analysis results");
  }
  
  toast({
    title: "Analysis successful",
    description: `Found ${formattedFeedback.length} insights about your design.`,
  });
  
  return formattedFeedback;
}
