
/**
 * Utility functions for compressing and processing images before upload
 */

/**
 * Creates a canvas for image processing
 * @param img The source image
 * @param width Target width
 * @param height Target height
 * @returns Canvas context and canvas element
 */
function createCanvas(img: HTMLImageElement, width: number, height: number): { 
  ctx: CanvasRenderingContext2D; 
  canvas: HTMLCanvasElement 
} {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }
  
  return { ctx, canvas };
}

/**
 * Creates a blob from canvas with specified quality
 * @param canvas Canvas element
 * @param type Image type (usually 'image/jpeg')
 * @param quality Compression quality (0-1)
 * @returns Promise resolving to a blob
 */
const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to create image blob'));
        return;
      }
      resolve(blob);
    }, type, quality);
  });
};

/**
 * Loads an image from a file
 * @param file Image file to load
 * @returns Promise resolving to an Image element
 */
const loadImageFromFile = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve(img);
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image for compression'));
    };
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Calculates dimensions while maintaining aspect ratio
 * @param originalWidth Original width
 * @param originalHeight Original height
 * @param maxWidth Maximum width constraint
 * @param maxHeight Maximum height constraint
 * @returns New dimensions {width, height}
 */
const calculateDimensions = (
  originalWidth: number, 
  originalHeight: number, 
  maxWidth: number, 
  maxHeight: number
): { width: number; height: number } => {
  let width = originalWidth;
  let height = originalHeight;
  
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
  
  return { width, height };
};

/**
 * Compresses an image to reduce its size while maintaining reasonable quality
 * @param file The original image file
 * @param maxWidth Maximum width for the compressed image
 * @param maxHeight Maximum height for the compressed image
 * @param quality Compression quality (0-1)
 * @returns Promise resolving to the compressed File
 */
export const compressImage = async (
  file: File, 
  maxWidth = 1600, 
  maxHeight = 1600, 
  quality = 0.8
): Promise<File> => {
  try {
    const img = await loadImageFromFile(file);
    
    // Check if image already small enough
    if (img.width <= maxWidth && img.height <= maxHeight && file.size <= 5 * 1024 * 1024) {
      return file;
    }

    // Calculate new dimensions while maintaining aspect ratio
    const { width, height } = calculateDimensions(img.width, img.height, maxWidth, maxHeight);
    
    // Create canvas and draw resized image
    const { canvas, ctx } = createCanvas(img, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    
    // Convert to compressed blob
    const blob = await canvasToBlob(canvas, 'image/jpeg', quality);
    
    // Create new file from blob
    const compressedFile = new File([blob], file.name, {
      type: 'image/jpeg',
      lastModified: Date.now()
    });
    
    console.log(`Image compressed from ${Math.round(file.size/1024)}KB to ${Math.round(compressedFile.size/1024)}KB`);
    return compressedFile;
  } catch (error) {
    console.error('Image compression error:', error);
    return file; // Return original file if compression fails
  }
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
