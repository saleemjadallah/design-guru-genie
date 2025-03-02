
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
  
  // Compress image if needed
  let processedBlob = blob;
  const maxSizeBytes = 4 * 1024 * 1024; // 4MB target (safely under 5MB limit)
  
  // Check size early and warn user
  if (blob.size > 5 * 1024 * 1024) {
    console.warn(`Image size is ${Math.round(blob.size/(1024*1024))}MB before compression (5MB limit)`);
    toast({
      title: "Large Image Detected",
      description: "Your image exceeds 5MB. Attempting to compress...",
      variant: "default",
    });
  }
  
  if (blob.size > maxSizeBytes) {
    try {
      processedBlob = await compressImage(blob, {
        maxWidth: 1200, 
        maxHeight: 1600, 
        quality: 0.7,
        maxSizeBytes
      });
      console.log(`Compressed combined image from ${Math.round(blob.size/1024)}KB to ${Math.round(processedBlob.size/1024)}KB`);
    } catch (err) {
      console.warn("Failed to compress combined image:", err);
      
      // Second attempt with more aggressive settings if first attempt failed
      try {
        processedBlob = await compressImage(blob, {
          maxWidth: 800,
          maxHeight: 1200,
          quality: 0.6,
          maxSizeBytes
        });
        console.log(`Second compression attempt: ${Math.round(blob.size/1024)}KB to ${Math.round(processedBlob.size/1024)}KB`);
      } catch (secondErr) {
        console.error("Both compression attempts failed:", secondErr);
        
        // Third extremely aggressive attempt
        try {
          processedBlob = await compressImage(blob, {
            maxWidth: 600,
            maxHeight: 800,
            quality: 0.5,
            maxSizeBytes
          });
          console.log(`Emergency compression attempt: ${Math.round(blob.size/1024)}KB to ${Math.round(processedBlob.size/1024)}KB`);
        } catch (thirdErr) {
          console.error("All compression attempts failed:", thirdErr);
          // Continue with original if compression fails
        }
      }
    }
  }
  
  // Check final image size after compression
  if (processedBlob.size > 5 * 1024 * 1024) {
    toast({
      title: "Warning: Image Too Large",
      description: "The image exceeds 5MB even after compression. Please reduce image size or try fewer screenshots.",
      variant: "destructive",
    });
    throw new Error(`Image size (${Math.round(processedBlob.size/(1024*1024))}MB) exceeds the 5MB limit even after compression. Please reduce image size or try fewer screenshots.`);
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

// Enhanced compressImage function with retry logic and size limits
async function compressImage(
  blob: Blob, 
  options: { maxWidth: number; maxHeight: number; quality: number; maxSizeBytes: number }
): Promise<Blob> {
  const { maxWidth, maxHeight, quality, maxSizeBytes } = options;
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      let currentQuality = quality;
      let currentWidth = img.width;
      let currentHeight = img.height;
      let attempt = 0;
      const maxAttempts = 4; // Increased max attempts
      
      // For very large images, apply more aggressive initial reduction
      if (img.width * img.height > 2000000) { // > 2 megapixels
        const scaleFactor = Math.sqrt(2000000 / (img.width * img.height));
        currentWidth = Math.floor(img.width * scaleFactor);
        currentHeight = Math.floor(img.height * scaleFactor);
        console.log(`Initial aggressive resize to ${currentWidth}x${currentHeight}`);
      }
      
      const compressWithSettings = () => {
        attempt++;
        console.log(`Compression attempt ${attempt} with dimensions ${currentWidth}x${currentHeight} and quality ${currentQuality}`);
        
        // Calculate new dimensions while maintaining aspect ratio
        let width = currentWidth;
        let height = currentHeight;
        
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
            
            console.log(`Result size: ${Math.round(resultBlob.size/1024)}KB`);
            
            // Check if the blob is still too large and we haven't reached max attempts
            if (resultBlob.size > maxSizeBytes && attempt < maxAttempts) {
              // Reduce dimensions and quality more aggressively with each attempt
              const scaleFactor = Math.min(0.8, Math.sqrt(maxSizeBytes / resultBlob.size) * 0.9);
              
              currentWidth = Math.floor(currentWidth * scaleFactor);
              currentHeight = Math.floor(currentHeight * scaleFactor);
              currentQuality = Math.max(0.4, currentQuality - 0.15); // More aggressive quality reduction
              
              compressWithSettings();
            } else {
              // Final size check with emergency compression
              if (resultBlob.size > 5 * 1024 * 1024 && attempt < maxAttempts) {
                // Emergency compression - very low quality
                currentWidth = Math.floor(currentWidth * 0.7);
                currentHeight = Math.floor(currentHeight * 0.7);
                currentQuality = 0.3;
                compressWithSettings();
                return;
              }
              
              if (resultBlob.size > maxSizeBytes) {
                console.warn(`Could not compress image below ${Math.round(maxSizeBytes/1024)}KB after ${attempt} attempts. Final size: ${Math.round(resultBlob.size/1024)}KB`);
              } else {
                console.log(`Successfully compressed image to ${Math.round(resultBlob.size/1024)}KB after ${attempt} attempts`);
              }
              
              resolve(resultBlob);
            }
          },
          'image/jpeg',
          currentQuality
        );
      };
      
      // Start compression with initial settings
      compressWithSettings();
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Error loading image for compression'));
    };
    
    img.src = url;
  });
}
