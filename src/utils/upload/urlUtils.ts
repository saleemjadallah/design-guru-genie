
/**
 * Processes a blob URL to get a Supabase storage URL
 * @param blobUrl Blob URL to process
 * @returns Promise resolving to Supabase storage URL
 */
import { uploadBlobToSupabase } from "@/utils/upload/imageUploadService";
import { convertImageFormat } from "@/utils/upload/formatConversion";

export async function processBlobUrl(blobUrl: string): Promise<string> {
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
 * Cleans up URL object references to prevent memory leaks
 * @param originalUrl Original URL that might need cleanup
 * @param processedUrl Processed URL that might need cleanup
 */
export function cleanupUrls(originalUrl: string, processedUrl: string): void {
  if (originalUrl.startsWith('blob:')) {
    console.log("Revoking blob URL to prevent memory leaks");
    URL.revokeObjectURL(originalUrl);
  }
  
  if (processedUrl !== originalUrl && processedUrl.startsWith('blob:')) {
    console.log("Revoking intermediate blob URL");
    URL.revokeObjectURL(processedUrl);
  }
}
