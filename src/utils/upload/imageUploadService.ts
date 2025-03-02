
import { supabase } from "@/integrations/supabase/client";

/**
 * Uploads a blob or blob URL to Supabase Storage and returns a public URL
 * @param blobOrUrl A Blob object or a blob URL string
 * @returns The public URL of the uploaded file
 */
export async function uploadBlobToSupabase(blobOrUrl: Blob | string): Promise<string> {
  console.log("Converting blob to file for upload");
  
  try {
    let blob: Blob;
    
    // If it's a string URL, fetch the blob
    if (typeof blobOrUrl === 'string') {
      const response = await fetch(blobOrUrl);
      blob = await response.blob();
    } else {
      // It's already a blob
      blob = blobOrUrl;
    }
    
    const file = new File([blob], "screenshot.png", { type: blob.type || 'image/png' });
    
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
    const publicUrl = urlData.publicUrl;
    console.log("Converted blob to public URL:", publicUrl);
    
    return publicUrl;
  } catch (blobError: any) {
    console.error("Error processing blob:", blobError);
    throw new Error(`Failed to process the image: ${blobError.message}`);
  }
}

/**
 * Validates an image URL to ensure it's usable for analysis
 */
export function validateImageUrl(imageUrl: string): void {
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
      // We don't modify the URL here - just validating
      console.log("URL could be re-encoded for better compatibility");
    }
  } catch (urlError) {
    console.error("Invalid URL format:", urlError);
    console.log("Proceeding with original URL format");
  }
}
