import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { handleAnalysisError } from "@/utils/upload/errorHandler";

// Define compression options interface
interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeBytes?: number;
}

// Add image compression utility with more aggressive defaults
async function compressImage(
  imageUrl: string, 
  options: CompressionOptions = {}
): Promise<string> {
  const {
    maxWidth = 800,    // Reduced from 1000 to 800
    maxHeight = 1000,  // Keep at 1000
    quality = 0.7,     // Keep at 0.7
    maxSizeBytes = 4 * 1024 * 1024 // 4MB target (to stay safely under 5MB limit)
  } = options;

  try {
    // For blob URLs or remote URLs
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    console.log(`Original image size: ${Math.round(blob.size/1024)}KB`);
    
    // If the image is already small enough, return it as is
    if (blob.size < maxSizeBytes) {
      console.log("Image already small enough, skipping compression");
      return imageUrl;
    }
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        let currentQuality = quality;
        let currentWidth = img.width;
        let currentHeight = img.height;
        let attempt = 0;
        const maxAttempts = 3;
        
        const compressWithSettings = () => {
          attempt++;
          console.log(`Compression attempt ${attempt} with dimensions ${currentWidth}x${currentHeight} and quality ${currentQuality}`);
          
          // Create canvas for resizing
          const canvas = document.createElement('canvas');
          canvas.width = currentWidth;
          canvas.height = currentHeight;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }
          
          ctx.drawImage(img, 0, 0, currentWidth, currentHeight);
          
          // Convert to compressed data URL
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Failed to create image blob'));
              return;
            }
            
            console.log(`Compressed to ${Math.round(blob.size/1024)}KB (${Math.round((blob.size/blob.size)*100)}% of original)`);
            
            // Check if the blob is still too large and we haven't reached max attempts
            if (blob.size > maxSizeBytes && attempt < maxAttempts) {
              // Reduce dimensions and quality for next attempt
              const scaleFactor = Math.sqrt(maxSizeBytes / blob.size);
              
              // Be more aggressive with each attempt
              currentWidth = Math.floor(currentWidth * (scaleFactor * 0.9));
              currentHeight = Math.floor(currentHeight * (scaleFactor * 0.9));
              currentQuality = Math.max(0.5, currentQuality - 0.1); // Don't go below 0.5 quality
              
              compressWithSettings();
            } else {
              if (blob.size > maxSizeBytes) {
                console.warn(`Could not compress image below ${Math.round(maxSizeBytes/1024)}KB after ${attempt} attempts. Final size: ${Math.round(blob.size/1024)}KB`);
              } else {
                console.log(`Successfully compressed image to ${Math.round(blob.size/1024)}KB after ${attempt} attempts`);
              }
              
              resolve(URL.createObjectURL(blob));
            }
          }, 'image/jpeg', currentQuality);
        };
        
        // Start compression with initial settings
        compressWithSettings();
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image for compression'));
      };
      
      img.src = URL.createObjectURL(blob);
    });
  } catch (error: any) {
    console.error('Image compression error:', error);
    throw new Error(`Failed to compress image: ${error.message}`);
  }
}

export async function processWithClaudeAI(imageUrl: string, compressionOptions: CompressionOptions = {}) {
  try {
    toast({
      title: "AI Analysis",
      description: "Our AI is analyzing your design for strengths and improvement opportunities...",
    });
    
    console.log("Sending to analyze-design with URL:", imageUrl);
    
    // Check if the image is a local blob URL
    if (imageUrl.startsWith('blob:')) {
      console.log("Converting blob URL to file for upload");
      try {
        // Fetch the blob and upload it to get a public URL
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], "screenshot.png", { type: blob.type });
        
        // Upload the file to Supabase Storage
        const timestamp = new Date().getTime();
        const filePath = `analysis_uploads/${timestamp}_screenshot.png`;
        
        const { error: uploadError } = await supabase.storage
          .from('designs')
          .upload(filePath, file);
          
        if (uploadError) {
          console.error("Error uploading blob to storage:", uploadError);
          throw new Error("Failed to upload image for analysis");
        }
        
        // Get the public URL
        const { data: urlData } = supabase.storage
          .from('designs')
          .getPublicUrl(filePath);
          
        // Update the imageUrl to use the public URL
        imageUrl = urlData.publicUrl;
        console.log("Converted blob to public URL:", imageUrl);
      } catch (blobError) {
        console.error("Error processing blob URL:", blobError);
        throw new Error(`Failed to process the image: ${blobError.message}`);
      }
    }
    
    // Check if the image is an SVG placeholder or data URL
    const isSvgPlaceholder = typeof imageUrl === 'string' && 
      (imageUrl.startsWith('data:image/svg') || imageUrl.includes('<svg'));
    
    if (isSvgPlaceholder) {
      console.log("Detected SVG placeholder instead of actual screenshot");
      throw new Error("SVG placeholder detected instead of actual screenshot");
    }
    
    // Check if the image URL is properly encoded
    try {
      const urlObject = new URL(imageUrl);
      // If the URL has special characters, ensure they're properly encoded
      if (urlObject.toString() !== imageUrl) {
        imageUrl = urlObject.toString();
        console.log("URL re-encoded:", imageUrl);
      }
    } catch (urlError) {
      console.error("Invalid URL format:", urlError);
      console.log("Proceeding with original URL format");
    }
    
    // Compress image before sending to Claude with more aggressive compression
    try {
      console.log("Compressing image before analysis...");
      const mergedOptions = {
        maxWidth: compressionOptions.maxWidth || 800,     // Reduced default
        maxHeight: compressionOptions.maxHeight || 1000,  // Same default
        quality: compressionOptions.quality || 0.65,      // Lower quality default
        maxSizeBytes: 4 * 1024 * 1024 // Ensure 4MB limit (safely under 5MB)
      };
      
      const compressedImageUrl = await compressImage(imageUrl, mergedOptions);
      console.log("Image compressed successfully");
      imageUrl = compressedImageUrl;
    } catch (compressionError) {
      console.warn("Image compression failed, proceeding with original:", compressionError);
      // Continue with the original URL - compression is optional
    }
    
    // Proceed with Claude analysis for proper images
    console.log("Calling analyze-design function with URL:", imageUrl);
    const { data: analyzeData, error: analyzeError } = await supabase.functions
      .invoke('analyze-design', {
        body: { 
          imageUrl,
          options: {
            maxTokens: 1500,     // Limit token usage
            temperature: 0.2,    // Lower temperature for more predictable results
            compressImage: true   // Tell Edge function to compress image as well
          }
        },
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
    if (analyzeError) {
      console.error("Claude analysis error:", analyzeError);
      const errorMsg = handleAnalysisError(analyzeError);
      // Additional detailed logging for Claude errors
      console.error("Claude error details:", JSON.stringify(analyzeError, null, 2));
      throw new Error(errorMsg);
    }
    
    console.log("Analysis results received:", analyzeData);
    
    // Handle various response formats from Claude
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
          if (content && content.type === 'text') {
            const jsonData = JSON.parse(content.text);
            return formatFeedbackFromJsonData(jsonData);
          } else {
            console.error("Unexpected content type or format:", content);
            throw new Error("Unexpected response format from Claude API");
          }
        } catch (parseError) {
          console.error("Error parsing JSON from Claude:", parseError);
          console.log("Raw response text:", analyzeData.result.content[0]?.text);
          throw new Error("Failed to parse Claude AI response. Please try again.");
        }
      } 
      // Direct JSON response from Claude
      else if (typeof analyzeData.result === 'object') {
        try {
          return formatFeedbackFromJsonData(analyzeData.result);
        } catch (error) {
          console.error("Error processing direct response:", error);
          console.log("Raw response data:", analyzeData.result);
          throw new Error("Failed to process analysis results. Please try again.");
        }
      }
    }
    
    // If we get here, there was an unexpected response format
    console.error("Invalid Claude AI response format:", analyzeData);
    throw new Error("Invalid response format from Claude AI service");
  } catch (analyzeError: any) {
    console.error("Error calling analyze-design function:", analyzeError);
    // Don't use fallbacks - propagate the error so the user knows exactly what happened
    throw analyzeError;
  }
}

// Helper function to format feedback consistently
function formatFeedbackFromJsonData(jsonData: any) {
  const formattedFeedback = [];
  
  // Add strengths as positive feedback
  if (jsonData.strengths && Array.isArray(jsonData.strengths)) {
    jsonData.strengths.forEach((strength: any, index: number) => {
      formattedFeedback.push({
        id: index + 1,
        type: "positive",
        title: strength.title,
        description: strength.description,
        location: strength.location || null
      });
    });
  }
  
  // Add issues as improvement feedback
  if (jsonData.issues && Array.isArray(jsonData.issues)) {
    jsonData.issues.forEach((issue: any, index: number) => {
      formattedFeedback.push({
        id: formattedFeedback.length + 1,
        type: "improvement",
        title: issue.issue,
        priority: issue.priority,
        description: issue.recommendation,
        location: issue.location || null,
        principle: issue.principle,
        technical_details: issue.technical_details
      });
    });
  }
  
  // Check if we have any feedback items
  if (formattedFeedback.length === 0) {
    console.error("No feedback items found in Claude response:", jsonData);
    throw new Error("No feedback items found in the analysis results");
  }
  
  toast({
    title: "Analysis successful",
    description: `Found ${formattedFeedback.length} insights about your design.`,
  });
  
  return formattedFeedback;
}
