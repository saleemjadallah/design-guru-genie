
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
    maxWidth = 800,    // Default width target
    maxHeight = 1000,  // Default height target
    quality = 0.7,     // Default quality
    maxSizeBytes = 4 * 1024 * 1024 // 4MB target (to stay safely under 5MB limit)
  } = options;

  try {
    // For blob URLs or remote URLs
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    console.log(`Original image size: ${Math.round(blob.size/1024)}KB`);
    
    // If the image is already small enough, return it as is
    if (blob.size < maxSizeBytes) {
      console.log("Image already small enough, skipping compression");
      return imageUrl;
    }
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        let currentQuality = quality;
        let currentWidth = img.width;
        let currentHeight = img.height;
        let attempt = 0;
        const maxAttempts = 3;
        
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
          
          ctx.drawImage(img, 0, 0, currentWidth, currentHeight);
          
          // Convert to compressed data URL
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Failed to create image blob'));
              return;
            }
            
            console.log(`Compressed to ${Math.round(blob.size/1024)}KB (${Math.round((blob.size/blob.size)*100)}% of original)`);
            
            // Check if the blob is still too large and we haven't reached max attempts
            if (blob.size > maxSizeBytes && attempt < maxAttempts) {
              // Reduce dimensions and quality for next attempt
              const scaleFactor = Math.sqrt(maxSizeBytes / blob.size);
              
              // Be more aggressive with each attempt
              currentWidth = Math.floor(currentWidth * (scaleFactor * 0.9));
              currentHeight = Math.floor(currentHeight * (scaleFactor * 0.9));
              currentQuality = Math.max(0.5, currentQuality - 0.1); // Don't go below 0.5 quality
              
              compressWithSettings();
            } else {
              if (blob.size > maxSizeBytes) {
                console.warn(`Could not compress image below ${Math.round(maxSizeBytes/1024)}KB after ${attempt} attempts. Final size: ${Math.round(blob.size/1024)}KB`);
              } else {
                console.log(`Successfully compressed image to ${Math.round(blob.size/1024)}KB after ${attempt} attempts`);
              }
              
              resolve(URL.createObjectURL(blob));
            }
          }, 'image/jpeg', currentQuality);
        };
        
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
