
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { handleStorageError, handleDatabaseError, handleUploadError } from "@/utils/upload/errorHandler";
import { processWithClaudeAI } from "@/services/claudeAnalysisService";

export const useImageUpload = () => {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  
  // Function to compress image before upload
  const compressImage = async (file: File, maxWidth = 1600, maxHeight = 1600, quality = 0.8): Promise<File> => {
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
  
  const analyzeImage = async (file: File) => {
    console.log("Handling image upload:", file.name, file.type, file.size);
    setIsUploading(true);
    
    try {
      // Start processing stages for UI feedback
      setCurrentStage(0);
      toast({
        title: "Upload started",
        description: `Uploading ${file.name} to our servers...`,
      });
      
      // Check file size before uploading
      if (file.size > 15 * 1024 * 1024) { // 15MB limit
        throw new Error("File is too large. Maximum size is 15MB. Please use a smaller image for better results.");
      }
      
      // Check dimensions if it's an image
      if (file.type.startsWith('image/')) {
        try {
          const dimensions = await getImageDimensions(file);
          console.log("Image dimensions:", dimensions);
          
          if (dimensions.width * dimensions.height > 4000 * 3000) {
            console.warn("Image is very large, will compress before analysis:", dimensions);
            toast({
              title: "Large Image Detected",
              description: "Your image is being compressed for optimal analysis.",
            });
          }
        } catch (e) {
          console.error("Failed to check image dimensions:", e);
          // Continue anyway, this is just a warning
        }
      }
      
      // Compress image if it's large
      let fileToUpload = file;
      if (file.size > 5 * 1024 * 1024 || (file.type.startsWith('image/') && file.type !== 'image/svg+xml')) {
        try {
          console.log("Compressing image before upload...");
          fileToUpload = await compressImage(file, 1600, 1600, 0.75);
          console.log("Image compressed successfully");
        } catch (compressionError) {
          console.warn("Image compression failed, proceeding with original:", compressionError);
          // Continue with the original file
        }
      }
      
      // Sanitize filename by replacing spaces and special characters with underscores
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const timestamp = new Date().getTime();
      const filePath = `uploads/${timestamp}_${sanitizedFileName}`;
      
      console.log("Uploading to path:", filePath);
      
      // Upload the file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('designs')
        .upload(filePath, fileToUpload);
        
      if (uploadError) {
        const errorMsg = handleStorageError(uploadError);
        if (fileToUpload.size > 5 * 1024 * 1024) {
          throw new Error("File is too large even after compression. Please use a smaller image.");
        }
        throw new Error(errorMsg);
      }
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('designs')
        .getPublicUrl(filePath);
      
      console.log("File uploaded, public URL:", publicUrl);
      setCurrentStage(1);
      toast({
        title: "Upload complete",
        description: "Your image has been uploaded successfully. Starting analysis...",
      });
      
      // Call analyze-design edge function to process with Claude - no fallbacks
      let analysisResults;
      
      try {
        console.log("Starting Claude analysis for:", publicUrl);
        analysisResults = await processWithClaudeAI(publicUrl);
        console.log("Claude analysis complete:", analysisResults);
      } catch (analysisError: any) {
        console.error("Analysis error:", analysisError);
        
        // Provide more specific error messages based on the error type
        let errorMessage = analysisError.message;
        
        if (errorMessage.includes("maximum call stack")) {
          errorMessage = "The image is too complex for our analysis service. Please try a smaller or simpler image.";
        } else if (errorMessage.includes("timeout")) {
          errorMessage = "The analysis took too long to complete. Please try a smaller image or try again later.";
        } else if (errorMessage.includes("non-2xx status code")) {
          errorMessage = "Our AI service encountered an issue. This might be due to image size or complexity.";
        }
        
        toast({
          title: "AI Analysis Failed",
          description: `Claude analysis error: ${errorMessage}. Please try again later.`,
          variant: "destructive",
        });
        
        setIsUploading(false);
        return;
      }
      
      setCurrentStage(2);
      toast({
        title: "Analysis complete",
        description: "Your design has been analyzed. Saving results...",
      });
      
      // Save the analysis to the database
      const { data: reviewData, error: reviewError } = await supabase
        .from('saved_reviews')
        .insert({
          title: `Review - ${file.name}`,
          image_url: publicUrl,
          feedback: analysisResults
        })
        .select()
        .single();
        
      if (reviewError) {
        const dbErrorMsg = handleDatabaseError(reviewError);
        throw new Error(dbErrorMsg);
      }
      
      setCurrentStage(3);
      toast({
        title: "Review saved",
        description: "Your design review has been saved. Redirecting to results...",
      });
      
      // Navigate to the new review page
      setTimeout(() => {
        setIsUploading(false);
        if (reviewData && reviewData.id) {
          navigate(`/analysis/${reviewData.id}`);
        } else {
          toast({
            title: "Error",
            description: "Failed to get review ID",
            variant: "destructive"
          });
        }
      }, 1000);
      
    } catch (error: any) {
      handleUploadError(error);
      setIsUploading(false);
    }
  };

  // Helper function to get image dimensions
  const getImageDimensions = (file: File): Promise<{width: number, height: number}> => {
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

  return {
    isUploading,
    currentStage,
    analyzeImage
  };
};
