
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
  
  // Create the file object
  const file = new File([processedBlob], "combined-screenshot.png", { type: "image/png" });
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
