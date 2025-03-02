
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { handleStorageError } from "@/utils/upload/errorHandler";
import { compressImage, getImageDimensions } from "@/utils/upload/imageCompression";

/**
 * Validates, processes and uploads an image to Supabase storage
 * @param file The file to process and upload
 * @returns The uploaded file path and public URL
 */
export const processAndUploadImage = async (file: File): Promise<{ filePath: string, publicUrl: string }> => {
  // Check file size before uploading
  if (file.size > 15 * 1024 * 1024) { // 15MB limit
    throw new Error("File is too large. Maximum size is 15MB. Please use a smaller image for better results.");
  }
  
  // Check dimensions if it's an image
  if (file.type.startsWith('image/')) {
    try {
      const dimensions = await getImageDimensions(file);
      console.log("Image dimensions:", dimensions);
      
      if (dimensions.width * dimensions.height > 4000 * 3000) {
        console.warn("Image is very large, will compress before analysis:", dimensions);
        toast({
          title: "Large Image Detected",
          description: "Your image is being compressed for optimal analysis.",
        });
      }
    } catch (e) {
      console.error("Failed to check image dimensions:", e);
      // Continue anyway, this is just a warning
    }
  }
  
  // Compress image if it's large
  let fileToUpload = file;
  if (file.size > 5 * 1024 * 1024 || (file.type.startsWith('image/') && file.type !== 'image/svg+xml')) {
    try {
      console.log("Compressing image before upload...");
      fileToUpload = await compressImage(file, 1600, 1600, 0.75);
      console.log("Image compressed successfully");
    } catch (compressionError) {
      console.warn("Image compression failed, proceeding with original:", compressionError);
      // Continue with the original file
    }
  }
  
  // Sanitize filename by replacing spaces and special characters with underscores
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
  const timestamp = new Date().getTime();
  const filePath = `uploads/${timestamp}_${sanitizedFileName}`;
  
  console.log("Uploading to path:", filePath);
  
  // Upload the file to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('designs')
    .upload(filePath, fileToUpload);
    
  if (uploadError) {
    const errorMsg = handleStorageError(uploadError);
    if (fileToUpload.size > 5 * 1024 * 1024) {
      throw new Error("File is too large even after compression. Please use a smaller image.");
    }
    throw new Error(errorMsg);
  }
  
  // Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from('designs')
    .getPublicUrl(filePath);
  
  console.log("File uploaded, public URL:", publicUrl);
  
  return { filePath, publicUrl };
};
