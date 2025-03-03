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
 * Enhanced error handler for AI analysis errors
 * Provides more detailed and actionable error messages
 * Includes troubleshooting steps for common issues
 */
export const handleAnalysisError = (analyzeError: any) => {
  console.error("Analysis error:", analyzeError);
  
  // Extract error message and any additional metadata
  const errorMessage = analyzeError.message || "";
  const statusCode = analyzeError.status || analyzeError.statusCode || 0;
  const errorType = analyzeError.type || analyzeError.code || "";
  
  // Additional logging for troubleshooting
  console.log(`Error details - Message: "${errorMessage}", Status: ${statusCode}, Type: ${errorType}`);
  
  // Default error message with troubleshooting guidance
  let errorMsg = "Error during AI analysis. Try using a simpler image or a different format.";
  
  // Check for network and connectivity errors
  if (errorMessage.includes("Failed to fetch") || 
      errorMessage.includes("Network error") ||
      errorMessage.includes("network") ||
      errorMessage.includes("CORS") ||
      errorMessage.includes("connection")) {
    errorMsg = "Network error while connecting to our AI service. Please check your connection and try again. If the problem persists, try using a smaller image.";
  }
  // Check for edge function errors
  else if (errorMessage.includes("Failed to send a request to the Edge Function") || 
      analyzeError.name === "FunctionsFetchError" ||
      errorMessage.includes("edge function") ||
      errorMessage.includes("Function execution error")) {
    errorMsg = "Our AI service is currently unavailable. Please try again in a few minutes. If the problem persists, try using a simpler JPEG image.";
  } 
  // Check for timeout errors with enhanced guidance
  else if (errorMessage.includes("timeout") || 
          errorMessage.includes("timed out") || 
          errorMessage.includes("aborted") || 
          statusCode === 408) {
    errorMsg = "Analysis timed out. Your design may be too complex for our AI service. Try these solutions:\n" +
               "1. Use a simpler screenshot with fewer UI elements\n" +
               "2. Try a JPEG format instead of PNG\n" +
               "3. Reduce image dimensions (e.g., resize to 1200×800 pixels)\n" +
               "4. Try again during off-peak hours";
  } 
  // Rate limits and quotas
  else if (errorMessage.includes("quota") || 
          errorMessage.includes("limit") ||
          errorMessage.includes("rate limit") ||
          statusCode === 429) {
    errorMsg = "We've reached our AI service limit. Please try again in 10-15 minutes. This is a temporary issue that occurs during peak usage.";
  } 
  // Authentication errors
  else if (errorMessage.includes("unauthorized") || 
          errorMessage.includes("authentication") ||
          errorMessage.includes("API key") ||
          statusCode === 401 ||
          statusCode === 403) {
    errorMsg = "Authentication error with our AI service. Please refresh the page and try again. If the problem persists, contact support.";
  } 
  // Image complexity errors
  else if (errorMessage.includes("maximum call stack") ||
          errorMessage.includes("image dimensions") ||
          errorMessage.includes("too large") ||
          errorMessage.includes("too complex")) {
    errorMsg = "Your image is too complex for our analysis service. Please try:\n" +
               "1. Using a smaller or lower-resolution image\n" +
               "2. Cropping to focus on the most important UI elements\n" +
               "3. Converting to JPEG format with 80% quality";
  } 
  // Server errors with transparency guidance
  else if (errorMessage.includes("non-2xx status code") || 
          errorMessage.includes("400") || 
          errorMessage.includes("500") ||
          errorMessage.includes("AI service encountered an error") ||
          (statusCode >= 400 && statusCode < 600)) {
    errorMsg = "AI service encountered an error analyzing your design. Common causes:\n" +
               "1. PNG images with transparency - convert to JPEG first\n" +
               "2. Very large or complex UI designs\n" +
               "3. Multiple screenshots - try with a single screenshot\n\n" +
               "For best results, use a simple JPEG screenshot without transparency.";
  } 
  // Image processing errors with specific guidance
  else if (errorMessage.includes("failed to process") || 
          errorMessage.includes("image processing") || 
          errorMessage.includes("CRITICAL:") ||
          errorMessage.includes("conversion failed") ||
          errorMessage.includes("dimensions") ||
          errorMessage.includes("size")) {
    errorMsg = "There was an error processing your image. Try these solutions:\n" +
               "1. Use a standard JPEG format instead of PNG\n" +
               "2. Resize to smaller dimensions (e.g., 1200×800 pixels)\n" +
               "3. Ensure the image doesn't contain transparency\n" +
               "4. Try a screenshot with simpler UI elements";
  } 
  // Response parsing and empty response errors
  else if (errorMessage.includes("Empty response") || 
          errorMessage.includes("no content") ||
          errorMessage.includes("parse") || 
          errorMessage.includes("JSON") ||
          errorMessage.includes("invalid format")) {
    errorMsg = "The AI couldn't generate a proper analysis of your design. This usually happens when:\n" +
               "1. The image quality is too low\n" +
               "2. The design has unusual elements the AI can't interpret\n" +
               "3. The image format is unsupported\n\n" +
               "Try a clearer screenshot or a different section of your UI.";
  } 
  // Format and transparency errors with clear guidance
  else if (errorMessage.includes("image format") || 
          errorMessage.includes("not supported") ||
          errorMessage.includes("transparency") || 
          errorMessage.includes("alpha channel") ||
          errorMessage.includes("PNG") ||
          errorMessage.includes("WebP")) {
    errorMsg = "Your image contains transparency which our AI can't process correctly. Please:\n" +
               "1. Convert PNG to JPEG format before uploading\n" +
               "2. Take a screenshot without transparent elements\n" +
               "3. If using design software, export with a white background\n\n" +
               "JPEG format works best for our AI analysis.";
  } 
  // Technical image processing errors
  else if (errorMessage.includes("canvas") || 
          errorMessage.includes("context") || 
          errorMessage.includes("blob") || 
          errorMessage.includes("data URL") ||
          errorMessage.includes("createImageBitmap") ||
          errorMessage.includes("buffer")) {
    console.error("Technical image processing error:", errorMessage);
    errorMsg = "Technical error processing your image. For best results:\n" +
               "1. Use standard JPEG format\n" +
               "2. Avoid screenshots with unusual aspect ratios\n" +
               "3. Try a simpler UI with fewer elements\n" +
               "4. Ensure your browser is up to date";
  }
  
  // If the error includes an HTTP status code, add it to the returned message for better debugging
  // But only in development environment
  if (process.env.NODE_ENV === 'development' && statusCode > 0) {
    errorMsg += ` (Status: ${statusCode})`;
  }
  
  return errorMsg;
};