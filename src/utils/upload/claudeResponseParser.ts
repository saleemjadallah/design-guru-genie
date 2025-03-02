
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
 * Checks if data is in our expected structured feedback format
 */
export function isStructuredFeedback(data: any): boolean {
  return (
    Array.isArray(data) && 
    data.length > 0 && 
    'type' in data[0] &&
    (data[0].type === 'positive' || data[0].type === 'improvement')
  );
}

/**
 * Parse and format Claude AI response data into our feedback format
 * @param data Raw response data from Claude
 * @returns Formatted feedback array
 */
export const parseClaudeResponseData = (data: any) => {
  // If data is already in our expected format, return it directly
  if (isStructuredFeedback(data)) {
    console.log("Data already in required format, using directly");
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
      const analysisResults = [];
      
      // Add strengths as positive feedback
      if (parsedData.strengths && Array.isArray(parsedData.strengths)) {
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
      if (parsedData.issues && Array.isArray(parsedData.issues)) {
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
      
      // Validate that we have some feedback items
      if (analysisResults.length === 0) {
        console.error("No feedback items found in parsed data:", parsedData);
        throw new Error("No feedback items found in the analysis results");
      }
      
      return analysisResults;
    } catch (parseError) {
      console.error("Error parsing Claude response:", parseError);
      throw new Error(`Failed to parse Claude response: ${parseError.message}`);
    }
  }
  
  // Try to extract data from Claude's "result" format
  if (data && data.result) {
    try {
      return extractDataFromResult(data.result);
    } catch (resultError) {
      console.error("Error extracting from result format:", resultError);
      throw resultError;
    }
  }
  
  // If we reach here, we don't know how to handle this data format
  console.error("Unknown data format:", data);
  throw new Error("Unrecognized data format from Claude API");
};

/**
 * Helper function to extract data from Claude's "result" format
 */
function extractDataFromResult(result: any) {
  // Check for error response
  if (result.type === 'error') {
    console.error("Claude API error:", result.error);
    throw new Error(`Claude API error: ${result.error.message || 'Unknown error'}`);
  }
  
  // Extract content from Claude's response
  if (result.content && Array.isArray(result.content)) {
    const content = result.content[0];
    if (content && content.type === 'text') {
      try {
        const jsonData = JSON.parse(content.text);
        return formatFeedbackFromJsonData(jsonData);
      } catch (parseError) {
        console.error("Error parsing JSON from Claude:", parseError);
        console.log("Raw response text:", result.content[0]?.text);
        throw new Error("Failed to parse Claude AI response. Please try again.");
      }
    }
  }
  
  // Direct JSON response from Claude
  if (typeof result === 'object') {
    try {
      return formatFeedbackFromJsonData(result);
    } catch (error) {
      console.error("Error processing direct response:", error);
      console.log("Raw response data:", result);
      throw new Error("Failed to process analysis results. Please try again.");
    }
  }
  
  throw new Error("Invalid response format from Claude AI service");
}

/**
 * Formats JSON data from Claude into our standardized feedback format
 */
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
  
  return formattedFeedback;
}
