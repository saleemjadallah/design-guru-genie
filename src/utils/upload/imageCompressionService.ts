
/**
 * Image compression service for Claude AI
 * Handles aggressive compression to ensure images are under API limits
 */

// Define compression options interface
export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeBytes?: number;
}

/**
 * Compresses an image to ensure it's under the size limit for API requests
 * Uses multiple compression attempts with increasingly aggressive settings
 * Always converts to JPEG format for Claude compatibility
 */
export async function compressImageForAPI(
  imageUrl: string, 
  options: CompressionOptions = {}
): Promise<string> {
  const {
    maxWidth = 800,    // Reduced default max width
    maxHeight = 1000,  // Default height target
    quality = 0.65,    // Lower quality default
    maxSizeBytes = 4 * 1024 * 1024 // 4MB target (to stay safely under 5MB limit)
  } = options;

  try {
    console.log("Starting image compression for Claude API, source URL type:", 
               imageUrl.startsWith('data:') ? 'data URL' : 
               imageUrl.startsWith('blob:') ? 'blob URL' : 'remote URL');
               
    // For blob URLs or remote URLs
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    console.log(`Original image: format=${blob.type}, size=${Math.round(blob.size/1024)}KB`);
    
    // Check if the image is SVG or has transparency - Claude might have issues with these
    if (blob.type.includes('svg') || blob.type.includes('webp') || blob.type.includes('png')) {
      console.warn(`${blob.type} format detected - converting to JPEG for better Claude compatibility`);
    }
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        let currentQuality = quality;
        let currentWidth = Math.min(img.width, maxWidth);
        let currentHeight = Math.min(img.height, maxHeight);
        let attempt = 0;
        const maxAttempts = 4;
        
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
          
          // Create canvas for resizing
          const canvas = document.createElement('canvas');
          canvas.width = currentWidth;
          canvas.height = currentHeight;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }
          
          // IMPORTANT: Always use white background for transparent images
          // This ensures Claude doesn't get confused by transparency
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          ctx.drawImage(img, 0, 0, currentWidth, currentHeight);
          
          // Always use JPEG format for Claude API - most consistently supported
          canvas.toBlob(async (blob) => {
            if (!blob) {
              reject(new Error('Failed to create image blob'));
              return;
            }
            
            const originalBlobSize = blob.size;
            console.log(`Compressed to ${Math.round(blob.size/1024)}KB (attempt ${attempt})`);
            
            // Check if the blob is still too large and we haven't reached max attempts
            if (blob.size > maxSizeBytes && attempt < maxAttempts) {
              // Reduce dimensions and quality more aggressively with each attempt
              const scaleFactor = Math.min(0.8, Math.sqrt(maxSizeBytes / blob.size));
              
              currentWidth = Math.floor(currentWidth * scaleFactor);
              currentHeight = Math.floor(currentHeight * scaleFactor);
              currentQuality = Math.max(0.4, currentQuality - 0.15); // More aggressive quality reduction
              
              compressWithSettings();
            } else {
              // Final size check
              if (blob.size > 5 * 1024 * 1024) {
                console.warn(`CRITICAL: Image still over 5MB limit after ${attempt} compression attempts`);
                
                // Emergency compression - final desperate attempt with very low quality
                if (attempt < maxAttempts) {
                  currentWidth = Math.floor(currentWidth * 0.7);
                  currentHeight = Math.floor(currentHeight * 0.7);
                  currentQuality = 0.3;
                  compressWithSettings();
                  return;
                }
              }
              
              // Convert blob to base64 data URL
              const reader = new FileReader();
              reader.onloadend = () => {
                const dataUrl = reader.result as string;
                console.log(`Final compressed size: ${Math.round(blob.size/1024)}KB after ${attempt} attempts`);
                console.log(`Output format: JPEG as data URL (first 30 chars): ${dataUrl.substring(0, 30)}...`);
                
                // Final size check
                try {
                  if (blob.size > 5 * 1024 * 1024) {
                    reject(new Error(`Failed to compress image below 5MB limit. Final size: ${(blob.size / (1024 * 1024)).toFixed(2)}MB`));
                    return;
                  }
                } catch (finalCheckError) {
                  console.warn("Final size check error:", finalCheckError);
                  // Continue despite the check error - we'll log but not fail
                }
                
                resolve(dataUrl);
              };
              reader.onerror = () => reject(new Error('Failed to convert image to data URL'));
              reader.readAsDataURL(blob);
            }
          }, 'image/jpeg', currentQuality); // Always use JPEG for Claude
        };
        
        // Start compression with initial settings
        compressWithSettings();
      };
      
      img.onerror = (err) => {
        console.error("Image loading error:", err);
        reject(new Error(`Failed to load image for compression: ${err}`));
      };
      
      // Set crossOrigin attribute for CORS issues with remote images
      if (!imageUrl.startsWith('data:') && !imageUrl.startsWith('blob:')) {
        img.crossOrigin = "anonymous";
      }
      
      img.src = URL.createObjectURL(blob);
    });
  } catch (error: any) {
    console.error('Image compression error:', error);
    throw new Error(`Failed to compress image: ${error.message}`);
  }
}
