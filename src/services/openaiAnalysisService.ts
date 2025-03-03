import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { handleAnalysisError } from "@/utils/upload/errorHandler";
import { compressImageForAPI } from "@/utils/upload/imageCompressionService";

// Define compression options interface
interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeBytes?: number;
  forceJpeg?: boolean;
}

/**
 * Main function to process an image with OpenAI analysis
 * Handles preprocessing, API calls, and error handling
 */
export async function processWithOpenAI(imageUrl: string, compressionOptions: CompressionOptions = {}) {
  // Store original URL for cleanup later
  const originalUrl = imageUrl;
  
  try {
    // Prepare image (compress, validate size)
    const processedImageUrl = await prepareImageForAnalysis(imageUrl, compressionOptions);
    
    // Call the OpenAI analysis API through Supabase Edge Function
    const analysisData = await callOpenAIAnalysisAPI(processedImageUrl);
    
    // Process the response
    const result = processOpenAIResponse(analysisData);
    
    // Clean up resources
    cleanupUrls(originalUrl, processedImageUrl);
    
    return result;
    
  } catch (analyzeError: any) {
    console.error("Error in OpenAI analysis process:", analyzeError);
    
    // Clean up resources even when there's an error
    cleanupUrls(originalUrl, imageUrl);
    
    const errorMsg = handleAnalysisError(analyzeError);
    throw new Error(errorMsg);
  }
}

/**
 * Compresses an image URL for OpenAI processing
 */
async function prepareImageForAnalysis(imageUrl: string, compressionOptions: CompressionOptions = {}) {
  try {
    console.log("Compressing image before analysis...");
    const mergedOptions = {
      maxWidth: compressionOptions.maxWidth || 800,
      maxHeight: compressionOptions.maxHeight || 1000,
      quality: compressionOptions.quality || 0.65,
      maxSizeBytes: 4 * 1024 * 1024, // Ensure 4MB limit
      forceJpeg: true // CRITICAL: Always force JPEG conversion
    };
    
    const compressedImageUrl = await compressImageForAPI(imageUrl, mergedOptions);
    console.log("Image compressed successfully");
    
    return compressedImageUrl;
  } catch (compressionError: any) {
    console.warn("Image compression failed, proceeding with original:", compressionError);
    
    // If compression failed due to size, we must stop here
    if (compressionError.message && compressionError.message.includes("too large")) {
      toast({
        title: "Image too large",
        description: compressionError.message,
        variant: "destructive",
      });
      throw compressionError;
    }
    
    // Otherwise continue with the original URL
    return imageUrl;
  }
}

/**
 * Makes a request to the OpenAI analysis endpoint through Supabase Edge Functions
 */
async function callOpenAIAnalysisAPI(imageUrl: string) {
  toast({
    title: "AI Analysis",
    description: "Our AI is analyzing your design for strengths and improvement opportunities...",
  });
  
  console.log("Calling analyze-design-openai function with image URL");
  
  // Add retry mechanism with exponential backoff
  const maxRetries = 2;
  let retryCount = 0;
  let lastError = null;
  
  while (retryCount <= maxRetries) {
    try {
      console.log(`Attempt ${retryCount + 1}/${maxRetries + 1} to call OpenAI API`);
      
      const { data: analyzeData, error: analyzeError } = await supabase.functions
        .invoke('analyze-design-openai', {
          body: { 
            imageUrl,
            options: {
              model: "gpt-4o", // Use GPT-4o for best vision analysis
              temperature: 0.1, // Lower temperature for more consistent results
              maxTokens: 1500,  // Enough tokens for detailed analysis
            }
          },
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
      if (analyzeError) {
        console.error("OpenAI analysis error:", analyzeError);
        throw analyzeError;
      }
      
      console.log("Analysis results received");
      
      // Verify we actually got a response
      if (!analyzeData) {
        throw new Error("Empty response from OpenAI API");
      }
      
      return analyzeData;
    } catch (error) {
      lastError = error;
      retryCount++;
      
      console.error(`Attempt ${retryCount}/${maxRetries + 1} failed:`, error);
      
      if (retryCount <= maxRetries) {
        const backoffDelay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        console.log(`Retry ${retryCount}/${maxRetries} after ${backoffDelay}ms delay`);
        
        toast({
          title: `Retry ${retryCount}/${maxRetries}`,
          description: "The AI service is taking longer than expected. Retrying...",
        });
        
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }
    }
  }
  
  // If we get here, all retries failed
  console.error("All retries failed. Last error:", lastError);
  throw lastError;
}

/**
 * Process OpenAI response into our standard feedback format
 */
function processOpenAIResponse(analyzeData: any) {
  console.log("Processing OpenAI response");
  
  try {
    // Check if the response is already in the expected format
    if (Array.isArray(analyzeData) && analyzeData.length > 0 && 
        ('type' in analyzeData[0]) && 
        (analyzeData[0].type === 'positive' || analyzeData[0].type === 'improvement')) {
      return analyzeData;
    }
    
    // Handle the response format from OpenAI
    if (analyzeData && analyzeData.feedback) {
      return formatOpenAIFeedback(analyzeData.feedback);
    }
    
    // If just raw content, try to process it
    if (analyzeData && analyzeData.content) {
      return formatOpenAIFeedback(analyzeData);
    }
    
    console.error("Unknown response format from OpenAI:", analyzeData);
    throw new Error("Invalid response format from OpenAI API");
  } catch (error) {
    console.error("Error processing OpenAI response:", error);
    throw error;
  }
}

/**
 * Format OpenAI feedback into our standard format
 */
function formatOpenAIFeedback(data: any) {
  try {
    const formattedFeedback = [];
    
    // Process strengths
    if (data.strengths && Array.isArray(data.strengths)) {
      data.strengths.forEach((strength: any, index: number) => {
        formattedFeedback.push({
          id: index + 1,
          type: "positive",
          title: strength.title || strength.point || "Design Strength",
          description: strength.description || strength.details || "",
          location: strength.location || null
        });
      });
    }
    
    // Process issues/improvements
    if (data.issues && Array.isArray(data.issues)) {
      data.issues.forEach((issue: any, index: number) => {
        formattedFeedback.push({
          id: formattedFeedback.length + 1,
          type: "improvement",
          title: issue.issue || issue.title || "Design Issue",
          priority: issue.priority || "medium",
          description: issue.recommendation || issue.details || issue.description || "",
          location: issue.location || null,
          principle: issue.principle || issue.category || "",
          technical_details: issue.technical_details || issue.solution || ""
        });
      });
    }
    
    // Validate that we have some feedback items
    if (formattedFeedback.length === 0) {
      console.error("No feedback items found in parsed data:", data);
      throw new Error("No feedback items found in the analysis results");
    }
    
    return formattedFeedback;
  } catch (error) {
    console.error("Error formatting OpenAI feedback:", error);
    throw new Error("Failed to format OpenAI feedback");
  }
}

/**
 * Cleans up URL object references to prevent memory leaks
 */
function cleanupUrls(originalUrl: string, processedUrl: string): void {
  if (originalUrl.startsWith('blob:')) {
    console.log("Revoking blob URL to prevent memory leaks");
    URL.revokeObjectURL(originalUrl);
  }
  
  if (processedUrl !== originalUrl && processedUrl.startsWith('blob:')) {
    console.log("Revoking intermediate blob URL");
    URL.revokeObjectURL(processedUrl);
  }
}
