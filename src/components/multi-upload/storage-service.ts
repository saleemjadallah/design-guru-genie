
import { supabase } from "@/integrations/supabase/client";

/**
 * Upload a file to Supabase storage
 * @param file File to upload
 * @returns Path and public URL of the uploaded file
 */
export async function uploadToStorage(file: File): Promise<{ filePath: string, publicUrl: string }> {
  // Create a timestamp and sanitized filename
  const timestamp = new Date().getTime();
  const sanitizedFileName = "combined_screenshot.png"; // Safe filename
  const filePath = `combined_screenshots/${timestamp}_${sanitizedFileName}`;
  
  console.log("Uploading combined image to path:", filePath);
  
  // Upload to Supabase storage
  const { data, error: uploadError } = await supabase.storage
    .from('designs')
    .upload(filePath, file);
    
  if (uploadError) {
    console.error("Combined image upload error:", uploadError);
    throw uploadError;
  }
  
  // Get the public URL
  const { data: urlData } = supabase.storage
    .from('designs')
    .getPublicUrl(filePath);
    
  console.log("Combined image public URL:", urlData.publicUrl);
  
  return {
    filePath,
    publicUrl: urlData.publicUrl
  };
}
