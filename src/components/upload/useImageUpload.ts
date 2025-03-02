
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
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        throw new Error("File is too large. Maximum size is 10MB. Please use a smaller image for better results.");
      }
      
      // Check dimensions if it's an image
      if (file.type.startsWith('image/')) {
        try {
          const dimensions = await getImageDimensions(file);
          console.log("Image dimensions:", dimensions);
          
          if (dimensions.width * dimensions.height > 4000 * 3000) {
            console.warn("Image is very large, may cause analysis issues:", dimensions);
            toast({
              title: "Large Image Detected",
              description: "Your image is very large and may take longer to analyze. For better results, consider using a smaller image.",
            });
          }
        } catch (e) {
          console.error("Failed to check image dimensions:", e);
          // Continue anyway, this is just a warning
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
        .upload(filePath, file);
        
      if (uploadError) {
        const errorMsg = handleStorageError(uploadError);
        if (file.size > 5 * 1024 * 1024) {
          throw new Error("File is too large. Maximum size is 5MB.");
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
      };
      img.onerror = () => {
        reject(new Error("Failed to load image"));
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
