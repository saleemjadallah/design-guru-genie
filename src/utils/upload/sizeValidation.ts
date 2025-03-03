
import { toast } from "@/hooks/use-toast";

/**
 * Performs final size verification before API call
 * @param imageUrl URL to verify
 * @returns Promise that resolves if validation passes, rejects if too large
 */
export async function verifyFinalImageSize(imageUrl: string): Promise<void> {
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
export function validateDataUrlSize(dataUrl: string): void {
  const base64Part = dataUrl.split(',')[1] || '';
  const estimatedSizeBytes = base64Part.length * 0.75;
  const estimatedSizeMB = estimatedSizeBytes / (1024 * 1024);
  
  console.log(`Estimated data URL size: ${estimatedSizeMB.toFixed(2)}MB`);
  
  if (estimatedSizeMB > 5) {
    throw new Error(`Image data is still too large (${estimatedSizeMB.toFixed(2)}MB) after compression. Maximum size allowed is 5MB.`);
  }
}
