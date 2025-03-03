
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { handleUploadError } from "@/utils/upload/errorHandler";
import { processWithOpenAI } from "@/services/openaiAnalysisService";
import { processAndUploadImage } from "@/utils/upload/imageProcessing";
import { saveReviewToDatabase } from "@/utils/upload/reviewStorage";

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
      
      // Process and upload the image
      const { publicUrl } = await processAndUploadImage(file);
      
      setCurrentStage(1);
      toast({
        title: "Upload complete",
        description: "Your image has been uploaded successfully. Starting analysis...",
      });
      
      // Analyze with OpenAI
      let analysisResults;
      
      try {
        console.log("Starting OpenAI analysis for:", publicUrl);
        analysisResults = await processWithOpenAI(publicUrl);
        console.log("OpenAI analysis complete:", analysisResults);
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
          description: `OpenAI analysis error: ${errorMessage}. Please try again later.`,
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
      const reviewData = await saveReviewToDatabase(
        `Review - ${file.name}`, 
        publicUrl, 
        analysisResults
      );
      
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

  return {
    isUploading,
    currentStage,
    analyzeImage
  };
};
