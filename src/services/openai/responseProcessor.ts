
import { FeedbackItem } from "./types";

/**
 * Process OpenAI response into our standard feedback format
 */
export function processOpenAIResponse(analyzeData: any): FeedbackItem[] {
  console.log("Processing OpenAI response");
  
  try {
    // Check if the response is already in the expected format
    if (Array.isArray(analyzeData) && analyzeData.length > 0 && 
        ('type' in analyzeData[0]) && 
        (analyzeData[0].type === 'positive' || analyzeData[0].type === 'improvement')) {
      return analyzeData;
    }
    
    // Handle the response format from OpenAI
    if (analyzeData && analyzeData.feedback) {
      return analyzeData.feedback;
    }
    
    // If just raw content, try to process it
    if (analyzeData && analyzeData.content) {
      return analyzeData.content;
    }
    
    // Simple transformation of strengths and issues
    const formattedFeedback: FeedbackItem[] = [];
    
    if (analyzeData.strengths && Array.isArray(analyzeData.strengths)) {
      analyzeData.strengths.forEach((strength: any, index: number) => {
        formattedFeedback.push({
          id: index + 1,
          type: "positive",
          title: strength.title || "Design Strength",
          description: strength.description || ""
        });
      });
    }
    
    if (analyzeData.issues && Array.isArray(analyzeData.issues)) {
      analyzeData.issues.forEach((issue: any, index: number) => {
        formattedFeedback.push({
          id: formattedFeedback.length + 1,
          type: "improvement",
          title: issue.issue || "Design Issue",
          priority: issue.priority || "medium",
          description: issue.recommendation || ""
        });
      });
    }
    
    return formattedFeedback;
  } catch (error) {
    console.error("Error processing OpenAI response:", error);
    throw error;
  }
}
