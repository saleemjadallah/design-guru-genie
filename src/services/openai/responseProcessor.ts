
import { FeedbackItem, OpenAIFeedback, Strength, Issue } from "./types";

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
      return formatOpenAIFeedback(analyzeData.feedback);
    }
    
    // If just raw content, try to process it
    if (analyzeData && analyzeData.content) {
      return formatOpenAIFeedback(analyzeData);
    }
    
    console.error("Unknown response format from OpenAI:", analyzeData);
    throw new Error("Invalid response format from OpenAI API");
  } catch (error) {
    console.error("Error processing OpenAI response:", error);
    throw error;
  }
}

/**
 * Format OpenAI feedback into our standard format
 */
export function formatOpenAIFeedback(data: OpenAIFeedback): FeedbackItem[] {
  try {
    const formattedFeedback: FeedbackItem[] = [];
    
    // Process strengths
    if (data.strengths && Array.isArray(data.strengths)) {
      data.strengths.forEach((strength: Strength, index: number) => {
        formattedFeedback.push({
          id: index + 1,
          type: "positive",
          title: strength.title || strength.point || "Design Strength",
          description: strength.description || strength.details || "",
          location: strength.location || null
        });
      });
    }
    
    // Process issues/improvements
    if (data.issues && Array.isArray(data.issues)) {
      data.issues.forEach((issue: Issue, index: number) => {
        formattedFeedback.push({
          id: formattedFeedback.length + 1,
          type: "improvement",
          title: issue.issue || issue.title || "Design Issue",
          priority: issue.priority || "medium",
          description: issue.recommendation || issue.details || issue.description || "",
          location: issue.location || null,
          principle: issue.principle || issue.category || "",
          technical_details: issue.technical_details || issue.solution || ""
        });
      });
    }
    
    // Validate that we have some feedback items
    if (formattedFeedback.length === 0) {
      console.error("No feedback items found in parsed data:", data);
      throw new Error("No feedback items found in the analysis results");
    }
    
    return formattedFeedback;
  } catch (error) {
    console.error("Error formatting OpenAI feedback:", error);
    throw new Error("Failed to format OpenAI feedback");
  }
}
