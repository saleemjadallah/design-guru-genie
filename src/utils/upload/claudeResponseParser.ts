
// Helper to type check Claude AI response structure
export interface ClaudeResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
}

/**
 * Type guard to check if an object is a Claude API response
 */
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

/**
 * Parse and format Claude AI response data into our feedback format
 * @param data Raw response data from Claude
 * @returns Formatted feedback array
 */
export const parseClaudeResponseData = (data: any) => {
  let analysisResults = [];
  
  // If data is provided directly in our expected format
  if (Array.isArray(data) && data.length > 0 && 'type' in data[0]) {
    return data;
  }
  
  // If data is a Claude response, parse it
  if (isClaudeResponse(data)) {
    try {
      console.log("Parsing Claude response format");
      // Try to parse the JSON from Claude's response
      const claudeResponse = data as ClaudeResponse;
      const parsedData = JSON.parse(claudeResponse.content[0].text);
      
      // Format the data for our feedback system
      analysisResults = [];
      
      // Add strengths as positive feedback
      if (parsedData.strengths) {
        parsedData.strengths.forEach((strength: any, index: number) => {
          analysisResults.push({
            id: index + 1,
            type: "positive",
            title: strength.title,
            description: strength.description,
            location: strength.location || null
          });
        });
      }
      
      // Add issues as improvement feedback
      if (parsedData.issues) {
        parsedData.issues.forEach((issue: any, index: number) => {
          analysisResults.push({
            id: analysisResults.length + 1,
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
      
      return analysisResults;
    } catch (parseError) {
      console.error("Error parsing Claude response:", parseError);
      throw new Error(`Failed to parse Claude response: ${parseError.message}`);
    }
  }
  
  // If data is already in our required format or can be used directly
  return data;
};
