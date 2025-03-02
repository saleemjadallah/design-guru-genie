
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
    // For blob URLs or remote URLs
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    console.log(`Original image size: ${Math.round(blob.size/1024)}KB`);
    
    // Check if the image is SVG - Claude might have issues with SVG images
    if (blob.type.includes('svg')) {
      console.warn("SVG format detected - Claude may have issues with this format");
      // We'll continue processing but warn the user about potential issues
    }
    
    // If the image is already small enough, return it as is but convert to data URL for consistency
    if (blob.size < maxSizeBytes) {
      console.log("Image already small enough, minimal processing needed");
      
      // Add a final explicit size check even for "small enough" images
      if (blob.size > 5 * 1024 * 1024) {
        throw new Error(`Image exceeds 5MB limit. Size: ${(blob.size / (1024 * 1024)).toFixed(2)}MB`);
      }
      
      // Always convert to JPEG data URL for Claude - more reliable than other formats
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }
          
          // Use white background for transparent images
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          ctx.drawImage(img, 0, 0);
          
          // Always use JPEG for Claude (most reliable format)
          canvas.toBlob((convBlob) => {
            if (!convBlob) {
              reject(new Error('Failed to convert image'));
              return;
            }
            
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error('Failed to read converted image'));
            reader.readAsDataURL(convBlob);
          }, 'image/jpeg', 0.9);
        };
        
        img.onerror = () => reject(new Error('Failed to load image for conversion'));
        img.src = URL.createObjectURL(blob);
      });
    }
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        let currentQuality = quality;
        let currentWidth = Math.min(img.width, maxWidth);
        let currentHeight = Math.min(img.height, maxHeight);
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
          
          // Create canvas for resizing
          const canvas = document.createElement('canvas');
          canvas.width = currentWidth;
          canvas.height = currentHeight;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }
          
          // Use white background for transparent images
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          ctx.drawImage(img, 0, 0, currentWidth, currentHeight);
          
          // Always use JPEG format for Claude API - most consistently supported
          canvas.toBlob(async (blob) => {
            if (!blob) {
              reject(new Error('Failed to create image blob'));
              return;
            }
            
            console.log(`Compressed to ${Math.round(blob.size/1024)}KB (${Math.round((blob.size/originalBlobSize)*100)}% of original)`);
            
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
        
        // Store the original blob size for percentage calculations
        const originalBlobSize = blob.size;
        
        // Start compression with initial settings
        compressWithSettings();
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image for compression'));
      };
      
      img.src = URL.createObjectURL(blob);
    });
  } catch (error: any) {
    console.error('Image compression error:', error);
    throw new Error(`Failed to compress image: ${error.message}`);
  }
}
