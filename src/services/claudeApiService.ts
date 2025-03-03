import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { compressImageForAPI } from "@/utils/upload/imageCompressionService";
import { uploadBlobToSupabase, validateImageUrl } from "@/utils/upload/imageUploadService";
import { emergencyConvertToJpeg } from "@/utils/upload/emergencyFormatConversion";
import { processClaudeResponse } from "@/services/claudeResponseProcessor";
import { formatFeedbackFromJsonData } from "@/utils/upload/feedbackFormatter";

/**
 * Makes a request to the Claude AI analysis endpoint through Supabase Edge Functions
 */
export async function callClaudeAnalysisAPI(imageUrl: string) {
  toast({
    title: "AI Analysis",
    description: "Our AI is analyzing your design for strengths and improvement opportunities...",
  });
  
  console.log("Calling analyze-design function with URL type:", 
              imageUrl.startsWith('data:') ? 'data URL' : 
              imageUrl.startsWith('blob:') ? 'blob URL' : 'remote URL');
  
  // Additional debug logging for URL type
  if (imageUrl.startsWith('data:')) {
    console.log("Data URL format:", imageUrl.substring(0, 30) + "...");
    
    // Check if the data URL is in a supported format
    const supportedFormats = ['data:image/jpeg', 'data:image/png', 'data:image/gif', 'data:image/webp'];
    const isSupported = supportedFormats.some(format => imageUrl.startsWith(format));
    
    if (!isSupported) {
      console.warn("Data URL is not in a supported format! Attempting conversion before analysis");
      
      try {
        // Convert to a supported format before proceeding
        imageUrl = await emergencyConvertToJpeg(imageUrl);
        console.log("Format conversion successful");
      } catch (conversionError) {
        console.error("Format conversion failed:", conversionError);
        console.warn("Proceeding with original format, but Claude analysis may fail");
      }
    } else {
      // Check if the data URL might be too large
      const estimatedSizeMB = (imageUrl.length * 0.75) / (1024 * 1024);
      if (estimatedSizeMB > 4.5) {
        console.warn(`Data URL is large (approximately ${estimatedSizeMB.toFixed(2)}MB). Attempting compression.`);
        try {
          imageUrl = await emergencyConvertToJpeg(imageUrl);
          console.log("Size reduction successful");
        } catch (compressionError) {
          console.error("Size reduction failed:", compressionError);
        }
      }
    }
  } else {
    console.log("Using remote URL for analysis:", imageUrl);
    
    // No warnings needed for PNG or other formats since Claude supports them
  }
  
  // Add retry mechanism with exponential backoff
  const maxRetries = 2;
  let retryCount = 0;
  let lastError = null;
  
  while (retryCount <= maxRetries) {
    try {
      // Add a special flag for multi-screenshot uploads
      const isMultiScreenshot = 
        (imageUrl.startsWith('data:') && imageUrl.length > 500000) || // Large data URL
        (imageUrl.includes('combined-screenshot') || imageUrl.includes('stitched'));
      
      if (isMultiScreenshot) {
        console.log("Detected multi-screenshot upload, adding special handling flags");
      }
      
      // Proceed with Claude analysis with more explicit options
      console.log(`Attempt ${retryCount + 1}/${maxRetries + 1} to call Claude API`);
      
      const { data: analyzeData, error: analyzeError } = await supabase.functions
        .invoke('analyze-design', {
          body: { 
            imageUrl,
            options: {
              maxTokens: 1500,     // Enough tokens for detailed analysis
              temperature: 0.1,    // Lower temperature for more consistent results
              format: "json",      // Explicitly request JSON format
              isMultiScreenshot: isMultiScreenshot, // Flag for special handling
              // Size parameters only if needed for very large images
              compressImage: imageUrl.length > 6000000,  // Only compress if needed (rough estimate for data URLs)
              // Allow all supported formats (JPEG, PNG, GIF, WebP)
              preserveFormat: true,     // Keep original format when possible
              // For multi-screenshots, handle dimensions differently
              quality: isMultiScreenshot ? 0.9 : 0.8,
              maxWidth: isMultiScreenshot ? 2000 : 2400,  // Allow larger dimensions
            }
          },
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
      if (analyzeError) {
        console.error("Claude analysis error:", analyzeError);
        // Additional detailed logging for Claude errors
        console.error("Claude error details:", JSON.stringify(analyzeError, null, 2));
        throw analyzeError;
      }
      
      console.log("Analysis results received, type:", typeof analyzeData);
      
      // Verify we actually got a response with content
      if (!analyzeData) {
        throw new Error("Empty response from Claude API");
      }
      
      // Log first bit of response for debugging
      console.log("Analysis response sample:", 
        typeof analyzeData === 'object' 
          ? JSON.stringify(analyzeData).substring(0, 100) + "..." 
          : analyzeData.toString().substring(0, 100) + "..."
      );
      
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
