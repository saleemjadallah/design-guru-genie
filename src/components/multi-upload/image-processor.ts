
import { supabase } from "@/integrations/supabase/client";
import { stitchImages } from "@/utils/image-stitching";
import { ScreenshotFile } from "./types";
import { toast } from "@/hooks/use-toast";

export async function generateCombinedImagePreview(
  screenshots: ScreenshotFile[]
): Promise<string> {
  // Sort screenshots by order
  const orderedScreenshots = [...screenshots].sort((a, b) => a.order - b.order);
  
  // Generate the combined image
  return await stitchImages(orderedScreenshots);
}

export async function processCombinedImage(
  combinedImage: string,
  updateProcessingStage: (stage: number) => void
): Promise<File> {
  // Convert data URL to File
  updateProcessingStage(0);
  
  const response = await fetch(combinedImage);
  const blob = await response.blob();
  
  // Compress image if it's large
  let processedBlob = blob;
  if (blob.size > 2 * 1024 * 1024) { // If larger than 2MB
    try {
      processedBlob = await compressImage(blob);
      console.log(`Compressed combined image from ${Math.round(blob.size/1024)}KB to ${Math.round(processedBlob.size/1024)}KB`);
    } catch (err) {
      console.warn("Failed to compress combined image:", err);
      // Continue with original if compression fails
    }
  }
  
  const file = new File([processedBlob], "combined-screenshot.png", { type: "image/png" });
  console.log("Processed combined image:", file.name, file.type, file.size);
  
  // Update processing stages
  updateProcessingStage(1);
  
  // Upload to storage
  const timestamp = new Date().getTime();
  const sanitizedFileName = "combined_screenshot.png"; // Safe filename
  const filePath = `combined_screenshots/${timestamp}_${sanitizedFileName}`;
  
  console.log("Uploading combined image to path:", filePath);
  
  const { data, error: uploadError } = await supabase.storage
    .from('designs')
    .upload(filePath, file);
    
  if (uploadError) {
    console.error("Combined image upload error:", uploadError);
    throw uploadError;
  }
  
  updateProcessingStage(2);
  
  // Get the public URL
  const { data: urlData } = supabase.storage
    .from('designs')
    .getPublicUrl(filePath);
    
  console.log("Combined image public URL:", urlData.publicUrl);
    
  // Use the uploaded file for analysis
  updateProcessingStage(3);
  
  return file;
}

// Helper function to compress image blobs
async function compressImage(blob: Blob, maxWidth = 1200, maxHeight = 1600, quality = 0.75): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      // Calculate new dimensions while maintaining aspect ratio
      let width = img.width;
      let height = img.height;
      
      const scaleFactor = Math.max(width / maxWidth, height / maxHeight);
      
      if (scaleFactor > 1) {
        width = Math.round(width / scaleFactor);
        height = Math.round(height / scaleFactor);
      }
      
      // Create canvas and context
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      // Draw image on canvas
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to blob
      canvas.toBlob(
        (resultBlob) => {
          if (!resultBlob) {
            reject(new Error('Could not create blob from canvas'));
            return;
          }
          resolve(resultBlob);
        },
        'image/png',
        quality
      );
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Error loading image for compression'));
    };
    
    img.src = url;
  });
}
