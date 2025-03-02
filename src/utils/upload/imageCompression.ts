
/**
 * Utility functions for compressing and processing images before upload
 */

/**
 * Compresses an image to reduce its size while maintaining reasonable quality
 * @param file The original image file
 * @param maxWidth Maximum width for the compressed image
 * @param maxHeight Maximum height for the compressed image
 * @param quality Compression quality (0-1)
 * @returns Promise resolving to the compressed File
 */
export const compressImage = async (file: File, maxWidth = 1600, maxHeight = 1600, quality = 0.8): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Check if image already small enough
      if (img.width <= maxWidth && img.height <= maxHeight && file.size <= 5 * 1024 * 1024) {
        URL.revokeObjectURL(img.src);
        resolve(file);
        return;
      }

      // Create canvas for resizing
      const canvas = document.createElement('canvas');
      
      // Calculate new dimensions while maintaining aspect ratio
      let width = img.width;
      let height = img.height;
      
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round(height * maxWidth / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round(width * maxHeight / height);
          height = maxHeight;
        }
      }
      
      // Set canvas dimensions and draw resized image
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(img.src);
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to compressed data URL
      canvas.toBlob((blob) => {
        if (!blob) {
          URL.revokeObjectURL(img.src);
          reject(new Error('Failed to create image blob'));
          return;
        }
        
        // Create new file from blob
        const compressedFile = new File([blob], file.name, {
          type: 'image/jpeg',
          lastModified: Date.now()
        });
        
        console.log(`Image compressed from ${Math.round(file.size/1024)}KB to ${Math.round(compressedFile.size/1024)}KB`);
        URL.revokeObjectURL(img.src);
        resolve(compressedFile);
      }, 'image/jpeg', quality);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image for compression'));
    };
    
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Gets the dimensions of an image file
 * @param file The image file to check
 * @returns Promise resolving to the image dimensions {width, height}
 */
export const getImageDimensions = (file: File): Promise<{width: number, height: number}> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height
      });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      reject(new Error("Failed to load image"));
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  });
};
