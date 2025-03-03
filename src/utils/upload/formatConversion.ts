
/**
 * Handles format conversion for non-JPEG/PNG images
 * @param originalBlob Original image blob
 * @returns Promise resolving to processed blob
 */
export async function convertImageFormat(originalBlob: Blob): Promise<Blob> {
  // Always convert all images to JPEG to avoid Claude issues with transparency
  // This ensures transparency is properly handled by filling with white background
  console.log(`Converting ${originalBlob.type} image to JPEG for Claude compatibility`);
  
  return new Promise<Blob>((resolve, reject) => {
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
      
      // CRITICAL: Use white background for all images
      // This eliminates transparency issues with Claude
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw the image on top of white background
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(img.src); // Clean up
      
      canvas.toBlob(
        newBlob => {
          if (!newBlob) {
            reject(new Error('Failed to convert image format'));
            return;
          }
          
          console.log(`Converted to JPEG: ${Math.round(newBlob.size/1024)}KB`);
          resolve(newBlob);
        },
        'image/jpeg',
        0.85
      );
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image for format conversion'));
    };
    
    img.src = URL.createObjectURL(originalBlob);
  });
}
