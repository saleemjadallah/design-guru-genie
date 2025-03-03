import { stitchImages } from "@/utils/image-stitching";
import { ScreenshotFile } from "./types";
import { toast } from "@/hooks/use-toast";
import { attemptImageCompression, verifyImageSize } from "./image-compression";
import { uploadToStorage } from "./storage-service";
import { dataUrlToFile } from "./image-conversion";

/**
 * Generate a combined image preview from multiple screenshots
 */
export async function generateCombinedImagePreview(
  screenshots: ScreenshotFile[]
): Promise<string> {
  // Sort screenshots by order
  const orderedScreenshots = [...screenshots].sort((a, b) => a.order - b.order);
  
  // Generate the combined image
  return await stitchImages(orderedScreenshots);
}

/**
 * Process a combined image for upload and analysis
 * @param combinedImage The data URL of the combined image
 * @param updateProcessingStage Function to update the UI with processing progress
 * @returns The processed file
 */
export async function processCombinedImage(
  combinedImage: string,
  updateProcessingStage: (stage: number) => void
): Promise<File> {
  // Update processing stages
  updateProcessingStage(0);
  
  // Convert data URL to blob
  const response = await fetch(combinedImage);
  const blob = await response.blob();
  
  // Check size early and warn user
  if (blob.size > 5 * 1024 * 1024) {
    console.warn(`Image size is ${Math.round(blob.size/(1024*1024))}MB before compression (5MB limit)`);
    toast({
      title: "Large Image Detected",
      description: "Your image exceeds 5MB. Attempting to compress...",
      variant: "default",
    });
  }
  
  // Attempt to compress the image if needed
  const maxSizeBytes = 4 * 1024 * 1024; // 4MB target (safely under 5MB limit)
  const processedBlob = await attemptImageCompression(blob, maxSizeBytes);
  
  // Verify the final image size
  if (!verifyImageSize(processedBlob)) {
    throw new Error(`Image size (${Math.round(processedBlob.size/(1024*1024))}MB) exceeds the 5MB limit even after compression. Please reduce image size or try fewer screenshots.`);
  }
  
  // Check the blob type and size, but Claude accepts multiple formats
  let finalBlob = processedBlob;
  let finalFormat = processedBlob.type;
  let finalExtension = "png";
  
  console.log(`Processed blob type: ${processedBlob.type}, size: ${Math.round(processedBlob.size/1024)}KB`);
  
  // If the blob is too large (close to 5MB), compress it further
  if (processedBlob.size > 4.5 * 1024 * 1024) {
    console.warn(`Blob is close to size limit (${Math.round(processedBlob.size/(1024*1024))}MB). Compressing further.`);
    
    try {
      // Create a new image from the blob
      const img = await createImageBitmap(processedBlob);
      
      // Create a canvas for compression
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Get canvas context
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Failed to get canvas context for compression');
      }
      
      // Draw the image
      ctx.drawImage(img, 0, 0);
      
      // Try as JPEG for better compression
      finalBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (newBlob) => {
            if (!newBlob) {
              reject(new Error('Failed to create compressed blob'));
            } else {
              resolve(newBlob);
            }
          },
          'image/jpeg',
          0.85 // Good quality but with compression
        );
      });
      
      finalFormat = 'image/jpeg';
      finalExtension = "jpg";
      console.log(`Compressed to JPEG: ${Math.round(finalBlob.size/1024)}KB`);
    } catch (error) {
      console.error('Error compressing blob:', error);
      console.warn('Using original blob, but it may exceed size limits');
    }
  }
  
  // Create the file object with the appropriate format
  const file = new File([finalBlob], `combined-screenshot.${finalExtension}`, { type: finalFormat });
  console.log("Processed combined image:", file.name, file.type, file.size);
  
  // Update processing stages
  updateProcessingStage(1);
  
  // Upload to storage
  try {
    await uploadToStorage(file);
  } catch (error) {
    console.error("Error uploading to storage:", error);
    throw error;
  }
  
  updateProcessingStage(2);
  updateProcessingStage(3);
  
  return file;
}