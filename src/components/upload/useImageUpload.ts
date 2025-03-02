
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { handleStorageError, handleDatabaseError, handleUploadError } from "@/utils/upload/errorHandler";
import { generateDummyFeedback } from "@/utils/upload/dummyData";
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
      
      // Call analyze-design edge function to process with Claude
      try {
        let analysisResults = await processWithClaudeAI(publicUrl);
        
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
      } catch (analysisError: any) {
        console.error("Analysis error:", analysisError);
        // If Claude analysis fails, provide a helpful error message
        // but still proceed with dummy data
        toast({
          title: "AI Analysis Limited",
          description: "We're using simulated results because our AI service is currently limited. Your design was still uploaded successfully.",
          variant: "destructive",
        });
        
        const dummyFeedback = generateDummyFeedback();
        
        // Still save the review with dummy data so the user can proceed
        const { data: reviewData, error: reviewError } = await supabase
          .from('saved_reviews')
          .insert({
            title: `Review - ${file.name} (Limited Analysis)`,
            image_url: publicUrl,
            feedback: dummyFeedback
          })
          .select()
          .single();
          
        if (reviewError) {
          console.error("Database error with dummy data:", reviewError);
          throw new Error("Error saving your review to the database.");
        }
        
        setCurrentStage(3);
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
      }
      
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
