
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
  
  if (analyzeError.message.includes("timeout")) {
    errorMsg = "Analysis timed out. Your design may be too complex or our service is busy.";
  } else if (analyzeError.message.includes("quota")) {
    errorMsg = "We've reached our AI service quota. Please try again later.";
  } else if (analyzeError.message.includes("rate limit")) {
    errorMsg = "Too many requests. Please try again in a few minutes.";
  }
  
  return errorMsg;
};
