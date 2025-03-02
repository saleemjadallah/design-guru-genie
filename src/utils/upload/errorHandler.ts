
import { toast } from "@/hooks/use-toast";

// Helper function to handle upload errors
export const handleUploadError = (error: any) => {
  console.error("Upload error:", error);
  toast({
    title: "Upload failed",
    description: error.message || "There was an error processing your design. Please try again.",
    variant: "destructive"
  });
};

// Helper function to handle storage upload errors
export const handleStorageError = (uploadError: any) => {
  console.error("Storage upload error:", uploadError);
  let errorMsg = "There was an error uploading your file.";
  
  if (uploadError.message.includes("storage quota")) {
    errorMsg = "Storage quota exceeded. Please try a smaller file or contact support.";
  } else if (uploadError.message.includes("not found")) {
    errorMsg = "Storage bucket not found. Please contact support.";
  } else if (uploadError.message.includes("unauthorized")) {
    errorMsg = "You don't have permission to upload files. Please log in again.";
  } else if (uploadError.message.includes("file size")) {
    errorMsg = "File is too large. Maximum size is 5MB.";
  }
  
  return errorMsg;
};

// Helper function to handle database errors
export const handleDatabaseError = (reviewError: any) => {
  console.error("Database error:", reviewError);
  let dbErrorMsg = "Error saving your review to the database.";
  
  if (reviewError.message.includes("duplicate key")) {
    dbErrorMsg = "A review with this title already exists. Please try again.";
  } else if (reviewError.message.includes("foreign key")) {
    dbErrorMsg = "Database reference error. Please contact support.";
  } else if (reviewError.message.includes("not-null")) {
    dbErrorMsg = "Missing required fields. Please try again.";
  }
  
  return dbErrorMsg;
};

// Helper function to handle analysis errors
export const handleAnalysisError = (analyzeError: any) => {
  console.error("Analysis error:", analyzeError);
  let errorMsg = "Error during AI analysis.";
  
  // Check for network and connectivity errors
  if (analyzeError.message?.includes("Failed to fetch") || 
      analyzeError.message?.includes("Network error") ||
      analyzeError.message?.includes("network")) {
    errorMsg = "Network error while connecting to our AI service. Please check your connection and try again.";
  }
  // Check for edge function errors
  else if (analyzeError.message?.includes("Failed to send a request to the Edge Function") || 
      analyzeError.name === "FunctionsFetchError" ||
      analyzeError.message?.includes("edge function")) {
    errorMsg = "Our AI service is currently unavailable. Please try again later.";
  } 
  // Check for Claude API errors
  else if (analyzeError.message?.includes("timeout") || analyzeError.message?.includes("timed out")) {
    errorMsg = "Analysis timed out. Your design may be too complex or our service is busy.";
  } else if (analyzeError.message?.includes("quota") || analyzeError.message?.includes("limit")) {
    errorMsg = "We've reached our AI service quota. Please try again later.";
  } else if (analyzeError.message?.includes("rate limit")) {
    errorMsg = "Too many requests. Please try again in a few minutes.";
  } else if (analyzeError.message?.includes("unauthorized") || analyzeError.message?.includes("authentication")) {
    errorMsg = "Authentication error with our AI service. Please try again later.";
  } else if (analyzeError.message?.includes("API key")) {
    errorMsg = "API configuration issue. Please contact support.";
  } else if (analyzeError.message?.includes("maximum call stack")) {
    errorMsg = "The image is too complex for our analysis service. Please try a smaller or simpler image.";
  } else if (analyzeError.message?.includes("non-2xx status code") || 
             analyzeError.message?.includes("400") || 
             analyzeError.message?.includes("500")) {
    errorMsg = "AI service encountered an error. Try using a different image format (JPG or PNG) or a simpler design.";
  } else if (analyzeError.message?.includes("Empty response") || analyzeError.message?.includes("no content")) {
    errorMsg = "The AI service returned an empty response. Please try again with a clearer image.";
  } else if (analyzeError.message?.includes("parse") || analyzeError.message?.includes("JSON")) {
    errorMsg = "Failed to process the AI response. Please try again later.";
  } else if (analyzeError.message?.includes("image format") || analyzeError.message?.includes("not supported")) {
    errorMsg = "The image format is not supported. Please try a JPG or PNG image.";
  }
  
  return errorMsg;
};
