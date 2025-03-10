
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { handleUploadError } from "@/utils/upload/errorHandler";
import { processUrlAnalysisData } from "@/utils/upload/urlAnalysisService";
import { saveUrlReviewToDatabase } from "@/utils/upload/urlReviewStorage";
import { processWithOpenAI } from "@/services/openaiAnalysisService";

export const useUrlAnalysis = () => {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);

  const analyzeUrl = async (imageUrl: string, data: any) => {
    console.log("Handling URL analysis:", imageUrl);
    console.log("Data provided:", data);
    setIsUploading(true);
    
    try {
      // Start processing stages for UI feedback
      setCurrentStage(0);
      toast({
        title: "Analysis started",
        description: "We're preparing to analyze your website URL...",
      });
      
      // Process data or get new analysis
      setCurrentStage(1);
      toast({
        title: "Processing URL",
        description: "Retrieving and analyzing website design elements...",
      });
      
      let analysisResults;
      try {
        // Try the primary analysis service
        analysisResults = await processUrlAnalysisData(imageUrl, data);
      } catch (primaryError) {
        console.error("Primary URL analysis failed, trying OpenAI fallback:", primaryError);
        
        toast({
          title: "Switching AI services",
          description: "Primary AI service unavailable, using backup service...",
        });
        
        // Fall back to OpenAI if the primary service fails
        try {
          analysisResults = await processWithOpenAI(imageUrl);
        } catch (fallbackError) {
          console.error("OpenAI fallback also failed:", fallbackError);
          throw new Error("All AI analysis services failed. Please try again later.");
        }
      }
      
      // Generate feedback and save to database
      setCurrentStage(2);
      toast({
        title: "Generating feedback",
        description: "Creating detailed design recommendations...",
      });
      
      // Save the analysis to the database and get the review data
      const reviewData = await saveUrlReviewToDatabase(imageUrl, analysisResults);
      
      setCurrentStage(3);
      
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
      console.error("URL analysis error:", error);
      handleUploadError(error);
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    currentStage,
    analyzeUrl
  };
};
