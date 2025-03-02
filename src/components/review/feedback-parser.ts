
import { Feedback, ClaudeResponse } from "./types";

// Helper function to type-check if an object is a Claude response
export function isClaudeResponse(obj: any): obj is ClaudeResponse {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    'content' in obj &&
    Array.isArray(obj.content) &&
    obj.content.length > 0 &&
    typeof obj.content[0] === 'object' &&
    'text' in obj.content[0] &&
    typeof obj.content[0].text === 'string'
  );
}

export function parseFeedback(data: any): Feedback[] {
  try {
    let parsed;
    
    // Check if feedback is a string that needs parsing
    if (typeof data.feedback === 'string') {
      parsed = JSON.parse(data.feedback);
    } 
    // Check if feedback is an object
    else if (data.feedback && typeof data.feedback === 'object') {
      // Check if this matches Claude's response format
      if (isClaudeResponse(data.feedback)) {
        try {
          const claudeResponse = data.feedback as ClaudeResponse;
          // Make sure content[0].text exists and is a string
          if (claudeResponse.content &&
              claudeResponse.content[0] &&
              claudeResponse.content[0].text) {
            
            const claudeContent = JSON.parse(claudeResponse.content[0].text);
            parsed = [];
            
            // Process strengths
            if (claudeContent.strengths) {
              claudeContent.strengths.forEach((strength: any, index: number) => {
                parsed.push({
                  id: index + 1,
                  type: "positive",
                  title: strength.title,
                  description: strength.description,
                  location: strength.location || null
                });
              });
            }
            
            // Process issues
            if (claudeContent.issues) {
              claudeContent.issues.forEach((issue: any, index: number) => {
                parsed.push({
                  id: parsed.length + 1,
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
          }
        } catch (parseError) {
          console.error("Error parsing Claude response:", parseError);
          // Handle parsing error - use the object as is if possible
          if (Array.isArray(data.feedback)) {
            parsed = data.feedback;
          }
        }
      } else {
        // Already in the correct format or array
        parsed = data.feedback;
      }
    } 
    
    if (Array.isArray(parsed)) {
      return parsed;
    } else {
      console.error("Feedback is not an array:", parsed);
      return [];
    }
  } catch (parseError) {
    console.error("Error parsing feedback:", parseError);
    return [];
  }
}
