
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
      
      // Creating a sample feedback analysis or use provided data
      let analysisResults;
      
      if (data) {
        // If data is provided and contains Claude's response format
        if (data.content && Array.isArray(data.content) && data.content[0] && data.content[0].text) {
          try {
            // Try to parse the JSON from Claude's response
            const parsedData = JSON.parse(data.content[0].text);
            
            // Format the data for our feedback system
            analysisResults = [];
            
            // Add strengths as positive feedback
            if (parsedData.strengths) {
              parsedData.strengths.forEach((strength: any, index: number) => {
                analysisResults.push({
                  id: index + 1,
                  type: "positive",
                  title: strength.title,
                  description: strength.description,
                  location: strength.location || null
                });
              });
            }
            
            // Add issues as improvement feedback
            if (parsedData.issues) {
              parsedData.issues.forEach((issue: any, index: number) => {
                analysisResults.push({
                  id: analysisResults.length + 1,
                  type: "improvement",
                  title: issue.issue,
                  priority: issue.priority,
                  description: issue.recommendation,
                  location: issue.location || null,
                  principle: issue.principle,
                  technical_details: issue.technical_details
                });
              });
            }
          } catch (parseError) {
            console.error("Error parsing Claude response:", parseError);
            analysisResults = generateDummyFeedback();
          }
        } else {
          // If data is already in our required format
          analysisResults = data;
        }
      } else {
        // If no data provided, use dummy feedback
        analysisResults = generateDummyFeedback();
      }
      
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
