
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
  const file = new File([blob], "combined-screenshot.png", { type: "image/png" });
  
  // Update processing stages
  updateProcessingStage(1);
  
  // Upload to storage if needed
  const timestamp = new Date().getTime();
  const sanitizedFileName = "combined_screenshot.png"; // Safe filename
  const filePath = `combined_screenshots/${timestamp}_${sanitizedFileName}`;
  
  console.log("Uploading combined image to path:", filePath);
  
  const { error: uploadError } = await supabase.storage
    .from('designs')
    .upload(filePath, file);
    
  if (uploadError) {
    console.error("Combined image upload error:", uploadError);
    throw uploadError;
  }
  
  updateProcessingStage(2);
  
  // Get the public URL
  supabase.storage
    .from('designs')
    .getPublicUrl(filePath);
    
  // Use the uploaded file for analysis
  updateProcessingStage(3);
  
  return file;
}
