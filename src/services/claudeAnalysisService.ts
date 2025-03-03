
import { toast } from "@/hooks/use-toast";
import { handleAnalysisError } from "@/utils/upload/errorHandler";
import { compressImageForAPI } from "@/utils/upload/imageCompressionService";
import { CompressionOptions } from "@/utils/upload/compression-types";
import { uploadBlobToSupabase, validateImageUrl } from "@/utils/upload/imageUploadService";
import { callClaudeAnalysisAPI, processClaudeResponse } from "@/services/claudeApiService";

/**
 * Handles format conversion for non-JPEG/PNG images
 * @param originalBlob Original image blob
 * @returns Promise resolving to processed blob
 */
async function convertImageFormat(originalBlob: Blob): Promise<Blob> {
  // Always convert all images to JPEG to avoid Claude issues with transparency
  // This ensures transparency is properly handled by filling with white background
  console.log(`Converting ${originalBlob.type} image to JPEG for Claude compatibility`);
  
  return new Promise<Blob>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      // CRITICAL: Use white background for all images
      // This eliminates transparency issues with Claude
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw the image on top of white background
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(img.src); // Clean up
      
      canvas.toBlob(
        newBlob => {
          if (!newBlob) {
            reject(new Error('Failed to convert image format'));
            return;
          }
          
          console.log(`Converted to JPEG: ${Math.round(newBlob.size/1024)}KB`);
          resolve(newBlob);
        },
        'image/jpeg',
        0.85
      );
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image for format conversion'));
    };
    
    img.src = URL.createObjectURL(originalBlob);
  });
}

/**
 * Processes a blob URL to get a Supabase storage URL
 * @param blobUrl Blob URL to process
 * @returns Promise resolving to Supabase storage URL
 */
async function processBlobUrl(blobUrl: string): Promise<string> {
  try {
    const response = await fetch(blobUrl);
    const originalBlob = await response.blob();
    
    console.log(`Original blob type: ${originalBlob.type}, size: ${Math.round(originalBlob.size/1024)}KB`);
    
    // Process the blob if needed
    const processedBlob = await convertImageFormat(originalBlob);
    
    // Upload to Supabase
    const supabaseUrl = await uploadBlobToSupabase(processedBlob);
    console.log("Uploaded blob to Supabase:", supabaseUrl);
    
    return supabaseUrl;
  } catch (error) {
    console.error("Failed to fetch or process blob URL:", error);
    throw new Error("Could not process local image data");
  }
}

/**
 * Performs final size verification before API call
 * @param imageUrl URL to verify
 * @returns Promise that resolves if validation passes, rejects if too large
 */
async function verifyFinalImageSize(imageUrl: string): Promise<void> {
  // Skip check for data URLs (they were already checked during compression)
  if (imageUrl.startsWith('data:')) {
    return;
  }
  
  try {
    const finalResponse = await fetch(imageUrl);
    const finalBlob = await finalResponse.blob();
    if (finalBlob.size > 5 * 1024 * 1024) {
      throw new Error(`Failed to compress image below 5MB limit. Final size: ${(finalBlob.size / (1024 * 1024)).toFixed(2)}MB`);
    }
  } catch (finalCheckError: any) {
    console.error("Final size check error:", finalCheckError);
    if (finalCheckError.message && finalCheckError.message.includes("5MB limit")) {
      toast({
        title: "Image too large",
        description: finalCheckError.message,
        variant: "destructive",
      });
      throw finalCheckError;
    }
    // If it's just a fetch error but not a size error, continue
  }
}

/**
 * Estimates data URL size and validates against 5MB limit
 * @param dataUrl Data URL to check
 */
function validateDataUrlSize(dataUrl: string): void {
  const base64Part = dataUrl.split(',')[1] || '';
  const estimatedSizeBytes = base64Part.length * 0.75;
  const estimatedSizeMB = estimatedSizeBytes / (1024 * 1024);
  
  console.log(`Estimated data URL size: ${estimatedSizeMB.toFixed(2)}MB`);
  
  if (estimatedSizeMB > 5) {
    throw new Error(`Image data is still too large (${estimatedSizeMB.toFixed(2)}MB) after compression. Maximum size allowed is 5MB.`);
  }
}

/**
 * Cleans up URL object references to prevent memory leaks
 * @param originalUrl Original URL that might need cleanup
 * @param processedUrl Processed URL that might need cleanup
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

/**
 * Compresses an image URL for Claude AI processing
 * @param imageUrl URL to compress
 * @param compressionOptions Options for compression
 * @returns Promise resolving to compressed image URL
 */
async function prepareImageForAnalysis(imageUrl: string, compressionOptions: CompressionOptions = {}): Promise<string> {
  try {
    console.log("Compressing image before analysis...");
    const mergedOptions = {
      maxWidth: compressionOptions.maxWidth || 800,     // Reduced default
      maxHeight: compressionOptions.maxHeight || 1000,  // Same default
      quality: compressionOptions.quality || 0.65,      // Lower quality default
      maxSizeBytes: 4 * 1024 * 1024, // Ensure 4MB limit (safely under 5MB)
      forceJpeg: true // CRITICAL: Always force JPEG conversion
    };
    
    const compressedImageUrl = await compressImageForAPI(imageUrl, mergedOptions);
    console.log("Image compressed successfully to data URL");
    
    // Validate size
    if (compressedImageUrl.startsWith('data:')) {
      validateDataUrlSize(compressedImageUrl);
    } else {
      await verifyFinalImageSize(compressedImageUrl);
    }
    
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
    
    // Otherwise continue with the original URL - compression is optional
    return imageUrl;
  }
}

/**
 * Main function to process an image with Claude AI analysis
 * Handles preprocessing, API calls, and error handling
 */
export async function processWithClaudeAI(imageUrl: string, compressionOptions: CompressionOptions = {}) {
  // Store original URL for cleanup later
  const originalUrl = imageUrl;
  
  try {
    // Process blob URLs
    if (imageUrl.startsWith('blob:')) {
      imageUrl = await processBlobUrl(imageUrl);
    }
    
    // Validate the image URL
    validateImageUrl(imageUrl);
    
    // Prepare image (compress, validate size)
    imageUrl = await prepareImageForAnalysis(imageUrl, compressionOptions);
    
    // Final size verification
    await verifyFinalImageSize(imageUrl);
    
    // Call the Claude AI analysis API
    const analyzeData = await callClaudeAnalysisAPI(imageUrl);
    
    // Process the response from Claude
    const result = processClaudeResponse(analyzeData);
    
    // Clean up resources
    cleanupUrls(originalUrl, imageUrl);
    
    return result;
    
  } catch (analyzeError: any) {
    console.error("Error in Claude AI analysis process:", analyzeError);
    
    // Clean up resources even when there's an error
    cleanupUrls(originalUrl, imageUrl);
    
    const errorMsg = handleAnalysisError(analyzeError);
    throw new Error(errorMsg);
  }
}
