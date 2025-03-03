
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { handleUploadError } from "@/utils/upload/errorHandler";
import { processWithClaudeAI } from "@/services/claudeAnalysisService";
import { processAndUploadImage } from "@/utils/upload/imageProcessing";
import { saveReviewToDatabase } from "@/utils/upload/reviewStorage";
import { processWithOpenAI } from "@/services/openaiAnalysisService";

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
      
      // Upload the image - no compression
      const { publicUrl } = await processAndUploadImage(file);
      
      setCurrentStage(1);
      toast({
        title: "Upload complete",
        description: "Your image has been uploaded successfully. Starting analysis...",
      });
      
      // Try to analyze with Claude AI first
      let analysisResults;
      try {
        console.log("Attempting analysis with Claude AI");
        analysisResults = await processWithClaudeAI(publicUrl);
        console.log("Claude analysis successful:", analysisResults);
      } catch (claudeError) {
        console.error("Claude analysis failed, falling back to OpenAI:", claudeError);
        
        toast({
          title: "Switching AI services",
          description: "Primary AI service unavailable, using backup service...",
        });
        
        // Fall back to OpenAI if Claude fails
        try {
          console.log("Attempting analysis with OpenAI");
          analysisResults = await processWithOpenAI(publicUrl);
          console.log("OpenAI analysis successful");
        } catch (openAIError) {
          console.error("OpenAI analysis also failed:", openAIError);
          throw new Error("All AI analysis services failed. Please try again later.");
        }
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
