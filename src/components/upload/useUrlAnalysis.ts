
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { handleUploadError, handleDatabaseError } from "@/utils/upload/errorHandler";
import { processWithClaudeAI } from "@/services/claudeAnalysisService";
import { generateDummyFeedback } from "@/utils/upload/dummyData";

// Helper to type check Claude AI response structure
interface ClaudeResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
}

export const useUrlAnalysis = () => {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);

  // Helper function to type-check if an object is a Claude response
  function isClaudeResponse(obj: any): obj is ClaudeResponse {
    return (
      obj !== null &&
      typeof obj === 'object' &&
      'content' in obj &&
      Array.isArray(obj.content) &&
      obj.content.length > 0 &&
      typeof obj.content[0] === 'object' &&
      'text' in obj.content[0] &&
      typeof obj.content[0].text === 'string'
    );
  }

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
      
      // Process the data from Claude API or get new analysis
      let analysisResults;
      let usedFallback = false;
      
      if (data) {
        console.log("Using provided analysis data");
        // If data is provided directly in our expected format
        if (Array.isArray(data) && data.length > 0 && 'type' in data[0]) {
          analysisResults = data;
        }
        // If data is a Claude response, parse it
        else if (isClaudeResponse(data)) {
          try {
            console.log("Parsing Claude response format");
            // Try to parse the JSON from Claude's response
            const claudeResponse = data as ClaudeResponse;
            const parsedData = JSON.parse(claudeResponse.content[0].text);
            
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
            // Try to process the URL directly with Claude
            toast({
              title: "Retrying analysis",
              description: "Processing your URL with our design analysis AI...",
            });
            try {
              analysisResults = await processWithClaudeAI(imageUrl);
            } catch (claudeError) {
              console.error("Claude API error:", claudeError);
              toast({
                title: "AI Analysis Limited",
                description: "We're using simulated results because our AI service is currently limited.",
                variant: "destructive",
              });
              analysisResults = generateDummyFeedback();
              usedFallback = true;
            }
          }
        } else {
          console.log("Using provided direct analysis data");
          // If data is already in our required format or can be used directly
          analysisResults = data;
        }
      } else {
        // If no data provided, use Claude API to analyze the URL
        setCurrentStage(1);
        toast({
          title: "Processing URL",
          description: "Retrieving and analyzing website design elements...",
        });
        
        console.log("No data provided - using Claude AI directly");
        // Call Claude AI service directly
        try {
          analysisResults = await processWithClaudeAI(imageUrl);
        } catch (claudeError) {
          console.error("Claude API error:", claudeError);
          toast({
            title: "AI Analysis Limited",
            description: "We're using simulated results because our AI service is currently limited.",
            variant: "destructive",
          });
          analysisResults = generateDummyFeedback();
          usedFallback = true;
        }
      }
      
      if (!analysisResults || (Array.isArray(analysisResults) && analysisResults.length === 0)) {
        throw new Error("Analysis produced no results. Please try again.");
      }
      
      setCurrentStage(2);
      
      if (!usedFallback) {
        toast({
          title: "Generating feedback",
          description: "Creating detailed design recommendations...",
        });
      }
      
      console.log("Saving analysis to database:", analysisResults);
      
      // Save the analysis to the database
      const { data: reviewData, error: reviewError } = await supabase
        .from('saved_reviews')
        .insert({
          title: `Website Review - ${new URL(imageUrl).hostname || 'URL'}${usedFallback ? ' (Limited Analysis)' : ''}`,
          image_url: imageUrl,
          feedback: analysisResults
        })
        .select()
        .single();
        
      if (reviewError) {
        console.error("Database error:", reviewError);
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
