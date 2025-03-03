
import { toast } from "@/hooks/use-toast";

/**
 * Simplified image preparation - no compression
 */
export async function prepareImageForAnalysis(imageUrl: string) {
  try {
    console.log("Preparing image for OpenAI analysis...");
    // No compression - just pass through the original URL
    return imageUrl;
  } catch (error: any) {
    console.warn("Image preparation error:", error);
    toast({
      title: "Image preparation error",
      description: error.message || "There was an error preparing your image for analysis.",
      variant: "destructive",
    });
    // Return the original URL as fallback
    return imageUrl;
  }
}

/**
 * Cleans up URL object references to prevent memory leaks
 */
export function cleanupUrls(originalUrl: string) {
  if (originalUrl.startsWith('blob:')) {
    console.log("Revoking blob URL to prevent memory leaks");
    URL.revokeObjectURL(originalUrl);
  }
}
