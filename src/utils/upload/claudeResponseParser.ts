
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
  console.log("Parsing Claude response data. Type:", typeof data);
  
  try {
    // If data is already in our expected format, return it directly
    if (isStructuredFeedback(data)) {
      console.log("Data already in required format, using directly");
      return data;
    }
    
    // If data is a direct JSON object from the Edge Function (most likely case)
    if (typeof data === 'object' && !Array.isArray(data)) {
      console.log("Processing direct JSON object from Edge Function");
      
      // Check for strengths and issues/improvements fields
      if ((data.strengths || data.issues || data.improvements) && 
          (Array.isArray(data.strengths) || Array.isArray(data.issues) || Array.isArray(data.improvements))) {
        console.log("Direct object has expected fields, formatting");
        return formatFeedbackFromJsonData(data);
      }
    }
    
    // If data is a Claude response object with content array
    if (isClaudeResponse(data)) {
      console.log("Processing standard Claude response format");
      try {
        const claudeResponse = data as ClaudeResponse;
        const parsedData = JSON.parse(claudeResponse.content[0].text);
        return formatFeedbackFromJsonData(parsedData);
      } catch (parseError) {
        console.error("Error parsing Claude response JSON:", parseError);
        console.log("Raw content:", data.content[0].text.substring(0, 200));
        
        // Try to extract JSON from potential markdown formatting
        const jsonMatches = data.content[0].text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatches && jsonMatches[1]) {
          try {
            console.log("Attempting to extract JSON from markdown code block");
            const extractedJson = JSON.parse(jsonMatches[1]);
            return formatFeedbackFromJsonData(extractedJson);
          } catch (e) {
            console.error("Failed to parse extracted JSON:", e);
          }
        }
        
        throw new Error(`Failed to parse Claude response: ${parseError.message}`);
      }
    }
    
    // Try to extract data from Claude's "result" format
    if (data && data.result) {
      console.log("Processing result-wrapped format");
      try {
        return extractDataFromResult(data.result);
      } catch (resultError) {
        console.error("Error extracting from result format:", resultError);
        throw resultError;
      }
    }
    
    // Last resort: if data is a string, try to parse it as JSON
    if (typeof data === 'string' && data.trim().startsWith('{')) {
      try {
        console.log("Attempting to parse string as JSON");
        const parsedJson = JSON.parse(data);
        return formatFeedbackFromJsonData(parsedJson);
      } catch (stringParseError) {
        console.error("Failed to parse string as JSON:", stringParseError);
      }
    }
    
    // If we reach here, we don't know how to handle this data format
    console.error("Unknown data format:", typeof data, data);
    throw new Error("Unrecognized data format from Claude API");
  } catch (error) {
    console.error("Error in parseClaudeResponseData:", error);
    throw error;
  }
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
  console.log("Formatting feedback from JSON data");
  const formattedFeedback = [];
  
  // Add strengths as positive feedback
  if (jsonData.strengths && Array.isArray(jsonData.strengths)) {
    console.log(`Processing ${jsonData.strengths.length} strengths`);
    jsonData.strengths.forEach((strength: any, index: number) => {
      formattedFeedback.push({
        id: index + 1,
        type: "positive",
        title: strength.title || "Design Strength",
        description: strength.description || strength.details || strength.text || "",
        location: strength.location || null
      });
    });
  }
  
  // First try the 'issues' field
  if (jsonData.issues && Array.isArray(jsonData.issues)) {
    console.log(`Processing ${jsonData.issues.length} issues`);
    jsonData.issues.forEach((issue: any, index: number) => {
      formattedFeedback.push({
        id: formattedFeedback.length + 1,
        type: "improvement",
        title: issue.issue || issue.title || "Design Issue",
        priority: issue.priority || "medium",
        description: issue.recommendation || issue.description || issue.details || issue.text || "",
        location: issue.location || null,
        principle: issue.principle || issue.designPrinciple || "",
        technical_details: issue.technical_details || issue.implementation || ""
      });
    });
  } 
  // Then try the 'improvements' field (alternate format)
  else if (jsonData.improvements && Array.isArray(jsonData.improvements)) {
    console.log(`Processing ${jsonData.improvements.length} improvements`);
    jsonData.improvements.forEach((improvement: any, index: number) => {
      formattedFeedback.push({
        id: formattedFeedback.length + 1,
        type: "improvement",
        title: improvement.title || improvement.issue || "Design Improvement",
        priority: improvement.priority || "medium",
        description: improvement.description || improvement.recommendation || improvement.details || "",
        location: improvement.location || null,
        principle: improvement.principle || improvement.designPrinciple || "",
        technical_details: improvement.technical_details || improvement.implementation || ""
      });
    });
  }
  
  // Add overall feedback as a special type
  if (jsonData.overallFeedback || jsonData.overview) {
    const overallFeedback = jsonData.overallFeedback || jsonData.overview;
    if (typeof overallFeedback === 'string' && overallFeedback.trim()) {
      console.log("Added overall feedback to results");
      formattedFeedback.push({
        id: 0, // Special ID for overall feedback
        type: "overview",
        title: "Overall Assessment",
        description: overallFeedback
      });
    }
  }
  
  // Check if we have any feedback items
  if (formattedFeedback.length === 0) {
    console.error("No feedback items found in Claude response:", jsonData);
    // If there's any kind of content, try to salvage it
    if (jsonData.ratings || jsonData.assessment || jsonData.analysis) {
      // Create a dummy feedback item
      formattedFeedback.push({
        id: 1,
        type: "overview",
        title: "Design Assessment",
        description: typeof jsonData === 'string' ? jsonData : 
                    JSON.stringify(jsonData.ratings || jsonData.assessment || jsonData.analysis)
      });
      console.warn("Created fallback feedback from available data");
      return formattedFeedback;
    }
    throw new Error("No feedback items found in the analysis results");
  }
  
  console.log(`Formatted ${formattedFeedback.length} feedback items`);
  return formattedFeedback;
}
