import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { formatFeedbackFromJsonData } from "@/utils/upload/feedbackFormatter";
import { compressImageForAPI } from "@/utils/upload/imageCompressionService";
import { uploadBlobToSupabase, validateImageUrl } from "@/utils/upload/imageUploadService";

/**
 * Emergency function to ensure data URL is in a valid format and size for Claude API
 * @param dataUrl Input data URL of any format
 * @returns Promise resolving to properly formatted data URL
 */
async function emergencyConvertToJpeg(dataUrl: string): Promise<string> {
  console.log("Starting emergency image format verification");
  
  try {
    // Convert data URL to blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    
    // Check if format is already acceptable
    if (blob.type === 'image/jpeg' || blob.type === 'image/png' || 
        blob.type === 'image/gif' || blob.type === 'image/webp') {
      
      // If size is good and format is supported, use as is
      if (blob.size <= 4.5 * 1024 * 1024) {
        console.log(`No conversion needed - format ${blob.type} is supported and size is acceptable`);
        return dataUrl;
      }
      
      console.log(`Format ${blob.type} is supported but size (${Math.round(blob.size/(1024*1024))}MB) is large. Compressing.`);
    } else {
      console.log(`Format ${blob.type} may not be supported. Converting to PNG.`);
    }
    
    // Create a new image from the blob
    const img = await createImageBitmap(blob);
    console.log(`Created image bitmap: ${img.width}x${img.height}`);
    
    // Create a canvas with the image dimensions
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    
    // Get context
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to get canvas context for conversion");
    }
    
    // Draw the image (no need for special handling)
    ctx.drawImage(img, 0, 0);
    
    // Try PNG format first
    const pngDataUrl = canvas.toDataURL("image/png");
    const pngSize = (pngDataUrl.length - 22) * 0.75 / (1024 * 1024); // Estimate size in MB
    
    if (pngSize <= 4.5) {
      console.log(`Converted to PNG: estimated ${pngSize.toFixed(2)}MB`);
      return pngDataUrl;
    }
    
    // If PNG is too large, try JPEG
    console.log(`PNG too large (${pngSize.toFixed(2)}MB). Trying JPEG format`);
    const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.9);
    
    console.log("Converted to JPEG format");
    return jpegDataUrl;
  } catch (error) {
    console.error("Error in image format conversion:", error);
    throw new Error(`Format conversion failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

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

/**
 * Handles various response formats from Claude API
 */
export function processClaudeResponse(analyzeData: any) {
  console.log("Processing Claude response, data type:", typeof analyzeData);
  
  try {
    // Case 1: Handle various response formats from Claude
    if (analyzeData && analyzeData.result) {
      // Check for error response
      if (analyzeData.result.type === 'error') {
        console.error("Claude API error:", analyzeData.result.error);
        throw new Error(`Claude API error: ${analyzeData.result.error.message || 'Unknown error'}`);
      }
      
      // Extract content from Claude's response
      if (analyzeData.result.content && Array.isArray(analyzeData.result.content)) {
        try {
          const content = analyzeData.result.content[0];
          console.log("Content type:", content?.type);
          
          if (content && content.type === 'text') {
            // Try to parse as JSON first
            try {
              const jsonData = JSON.parse(content.text);
              console.log("Successfully parsed JSON from Claude response");
              return formatFeedbackFromJsonData(jsonData);
            } catch (jsonParseError) {
              // If JSON parsing fails, log the error and raw text for debugging
              console.error("JSON parse error:", jsonParseError);
              console.log("Raw text from Claude (first 200 chars):", content.text.substring(0, 200));
              
              // Try to extract JSON from the text response (sometimes Claude wraps JSON in markdown)
              const jsonMatch = content.text.match(/```json\s*([\s\S]*?)\s*```/);
              if (jsonMatch && jsonMatch[1]) {
                try {
                  const extractedJson = JSON.parse(jsonMatch[1]);
                  console.log("Successfully extracted JSON from markdown code block");
                  return formatFeedbackFromJsonData(extractedJson);
                } catch (extractError) {
                  console.error("Failed to parse extracted JSON:", extractError);
                }
              }
              
              throw new Error("Failed to parse Claude AI response. The response was not in JSON format.");
            }
          } else {
            console.error("Unexpected content type or format:", content);
            throw new Error("Unexpected response format from Claude API");
          }
        } catch (parseError) {
          console.error("Error parsing response from Claude:", parseError);
          console.log("Raw response content:", JSON.stringify(analyzeData.result.content));
          throw new Error("Failed to parse Claude AI response. Please try again.");
        }
      }
      // Direct JSON response from Claude
      else if (typeof analyzeData.result === 'object') {
        try {
          return formatFeedbackFromJsonData(analyzeData.result);
        } catch (error) {
          console.error("Error processing direct response:", error);
          console.log("Raw response data:", JSON.stringify(analyzeData.result, null, 2).substring(0, 500) + "...");
          throw new Error("Failed to process analysis results. Please try again.");
        }
      }
    }
    // Case 2: Response is already in the expected format
    else if (Array.isArray(analyzeData)) {
      console.log("Response is already an array with", analyzeData.length, "items");
      return analyzeData;
    }
    // Case 3: Direct object that needs formatting
    else if (typeof analyzeData === 'object' && analyzeData !== null) {
      try {
        console.log("Trying to format direct object response");
        return formatFeedbackFromJsonData(analyzeData);
      } catch (error) {
        console.error("Error processing direct object:", error);
        throw new Error("Failed to process object response. Please try again.");
      }
    }
  } catch (error) {
    console.error("Error in processClaudeResponse:", error);
    throw error;
  }
  
  // If we get here, there was an unexpected response format
  console.error("Invalid Claude AI response format:", typeof analyzeData, analyzeData);
  throw new Error("Invalid response format from Claude AI service");
}