
import { toast } from "@/hooks/use-toast";
import { processWithOpenAI } from "@/services/openaiAnalysisService";
import { handleUrlAnalysisError, handleUrlAnalysisSuccess } from "@/utils/upload/urlAnalysisErrorHandler";

/**
 * Process data or get new analysis from OpenAI API
 * @param imageUrl URL of the screenshot or website
 * @param data Optional pre-existing data
 * @returns Analysis results in the required format
 */
export const processUrlAnalysisData = async (imageUrl: string, data?: any) => {
  // Store original URL for cleanup later
  const originalUrl = imageUrl;
  
  // Check image URL before proceeding
  if (!imageUrl) {
    toast({
      title: "Error",
      description: "No image URL provided for analysis",
      variant: "destructive",
    });
    throw new Error("No image URL provided for analysis");
  }
  
  // If data is provided, try to use it
  if (data && Array.isArray(data) && data.length > 0) {
    console.log("Using provided analysis data");
    handleUrlAnalysisSuccess(data.length);
    return data;
  }

  try {
    // Use OpenAI API for analysis
    console.log("Using OpenAI for URL analysis");
    
    // Use more aggressive compression options
    const compressionOptions = {
      maxWidth: 800,
      maxHeight: 1000,
      quality: 0.65,
      maxSizeBytes: 4 * 1024 * 1024 // 4MB target (safely under 5MB)
    };
    
    const results = await processWithOpenAI(imageUrl, compressionOptions);
    if (results && Array.isArray(results) && results.length > 0) {
      handleUrlAnalysisSuccess(results.length);
    }
    return results;
  } catch (openAIError: any) {
    console.error("OpenAI API error:", openAIError);
    const errorMessage = handleUrlAnalysisError(openAIError);
    throw new Error(errorMessage);
  } finally {
    // Ensure blob URLs are properly revoked to prevent memory leaks
    if (originalUrl.startsWith('blob:')) {
      console.log("Revoking blob URL in URL analysis service");
      URL.revokeObjectURL(originalUrl);
    }
  }
};
