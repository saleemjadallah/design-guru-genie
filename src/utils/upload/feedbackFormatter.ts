
import { toast } from "@/hooks/use-toast";

/**
 * Formats JSON data from Claude AI into a standardized feedback format
 * for displaying in the UI
 */
export function formatFeedbackFromJsonData(jsonData: any) {
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
