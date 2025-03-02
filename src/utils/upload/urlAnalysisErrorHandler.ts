
import { toast } from "@/hooks/use-toast";

/**
 * Handles errors specific to URL analysis processing
 * @param error The error object to handle
 * @returns A standardized error message
 */
export function handleUrlAnalysisError(error: any): string {
  console.error("URL analysis error:", error);
  
  // Determine the specific type of error
  if (error.message?.includes("Failed to send a request to the Edge Function") || 
      error.name === "FunctionsFetchError") {
    toast({
      title: "Service unavailable",
      description: "The URL analysis feature is currently unavailable. Please try again later or upload a screenshot instead.",
      variant: "destructive",
    });
    return "URL analysis service is currently unavailable";
  } 
  
  if (error.message?.includes("timeout") || error.message?.includes("timed out")) {
    toast({
      title: "Analysis timeout",
      description: "The analysis took too long to complete. It might be too complex or our service is busy.",
      variant: "destructive",
    });
    return "Analysis timed out. Please try again later or with a simpler design";
  }
  
  if (error.message?.includes("parse") || error.message?.includes("JSON")) {
    toast({
      title: "Response format error",
      description: "We couldn't process the AI analysis response. Please try again.",
      variant: "destructive",
    });
    return "Failed to parse analysis results";
  }
  
  // Default error handling
  toast({
    title: "URL analysis failed",
    description: error.message || "There was an error analyzing the URL. Please try again.",
    variant: "destructive"
  });
  
  return error.message || "Unknown URL analysis error";
}

/**
 * Handles successful URL analysis with appropriate toast notification
 */
export function handleUrlAnalysisSuccess(resultsCount: number): void {
  toast({
    title: "Analysis complete",
    description: `Analysis found ${resultsCount} design insights.`,
  });
}
