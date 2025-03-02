
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { handleUploadError, handleDatabaseError } from "@/utils/upload/errorHandler";
import { generateDummyFeedback } from "@/utils/upload/dummyData";

export const useUrlAnalysis = () => {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);

  const analyzeUrl = async (imageUrl: string, data: any) => {
    console.log("Handling URL upload:", imageUrl);
    setIsUploading(true);
    
    try {
      // Start processing stages for UI feedback
      setCurrentStage(0);
      toast({
        title: "Analysis started",
        description: "We're preparing to analyze your website URL...",
      });
      
      // Creating a sample feedback analysis
      const analysisResults = data || generateDummyFeedback();
      
      setCurrentStage(1);
      toast({
        title: "Processing URL",
        description: "Retrieving and analyzing website design elements...",
      });
      
      setCurrentStage(2);
      toast({
        title: "Generating feedback",
        description: "Creating detailed design recommendations...",
      });
      
      // Save the analysis to the database
      const { data: reviewData, error: reviewError } = await supabase
        .from('saved_reviews')
        .insert({
          title: `Website Review - ${new URL(imageUrl).hostname || 'URL'}`,
          image_url: imageUrl,
          feedback: analysisResults
        })
        .select()
        .single();
        
      if (reviewError) {
        const errorMsg = handleDatabaseError(reviewError);
        throw new Error(errorMsg);
      }
      
      setCurrentStage(3);
      toast({
        title: "Review saved",
        description: "Your website design review has been saved. Redirecting to results...",
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
    analyzeUrl
  };
};
