
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

/**
 * Error handler for Claude AI analysis errors with improved edge function diagnosis
 */
export const handleAnalysisError = (analyzeError: any) => {
  console.error("Analysis error:", analyzeError);
  
  // Extract error message
  const errorMessage = analyzeError.message || "";
  
  // Default error message
  let errorMsg = "Error during AI analysis. Please try again.";
  
  // Check for edge function specific errors
  if (errorMessage.includes("Failed to send a request to the Edge Function")) {
    errorMsg = "Could not connect to the Edge Function. Please make sure 'analyze-design' function is deployed correctly in Supabase.";
  }
  // Check for specific error types
  else if (errorMessage.includes("Failed to fetch") || 
      errorMessage.includes("Network error")) {
    errorMsg = "Network error while connecting to our AI service. Please check your connection and try again.";
  }
  else if (errorMessage.includes("Edge Function") && errorMessage.includes("correctly")) {
    errorMsg = "Edge Function configuration issue. Please check that the 'analyze-design' function exists and is deployed.";
  } 
  else if (errorMessage.includes("timeout") || errorMessage.includes("timed out")) {
    errorMsg = "Analysis timed out. Please try again later.";
  } 
  else if (errorMessage.includes("unauthorized") || errorMessage.includes("authentication")) {
    errorMsg = "Authentication error with our AI service. Please refresh the page and try again.";
  }
  else if (errorMessage.includes("Claude API key")) {
    errorMsg = "There's an issue with the Claude API key. Please check that ANTHROPIC_API_KEY is correctly set in the Edge Function secrets.";
  }
  else if (errorMessage.includes("ANTHROPIC_API_KEY")) {
    errorMsg = "ANTHROPIC_API_KEY configuration issue. Make sure it has the EXACT name 'ANTHROPIC_API_KEY' (case sensitive) in Edge Function secrets.";
  }
  
  return errorMsg;
};
