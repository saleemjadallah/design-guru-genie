
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useImageAnalysis = () => {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  
  const analyzeImage = async (file: File) => {
    console.log("Handling image upload:", file.name);
    setIsUploading(true);
    
    try {
      // Start processing stages for UI feedback
      setCurrentStage(0);
      
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
        console.error("Storage upload error:", uploadError);
        throw uploadError;
      }
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('designs')
        .getPublicUrl(filePath);
      
      console.log("File uploaded, public URL:", publicUrl);
      setCurrentStage(1);
      
      // Call analyze-design edge function to process with Claude
      let analysisResults = await processWithClaudeAI(publicUrl);
      
      setCurrentStage(2);
      
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
        console.error("Database error:", reviewError);
        throw reviewError;
      }
      
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
      
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "There was an error processing your design. Please try again.",
        variant: "destructive"
      });
      setIsUploading(false);
    }
  };

  const analyzeUrl = async (imageUrl: string, data: any) => {
    console.log("Handling URL upload:", imageUrl);
    setIsUploading(true);
    
    try {
      // Start processing stages for UI feedback
      setCurrentStage(0);
      
      // Creating a sample feedback analysis
      const analysisResults = data || generateDummyFeedback();
      
      setCurrentStage(1);
      setCurrentStage(2);
      
      // Save the analysis to the database
      const { data: reviewData, error: reviewError } = await supabase
        .from('saved_reviews')
        .insert({
          title: `Website Review`,
          image_url: imageUrl,
          feedback: analysisResults
        })
        .select()
        .single();
        
      if (reviewError) throw reviewError;
      
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
      
    } catch (error) {
      console.error("URL analysis error:", error);
      toast({
        title: "Analysis failed",
        description: "There was an error analyzing the URL. Please try again.",
        variant: "destructive"
      });
      setIsUploading(false);
    }
  };

  async function processWithClaudeAI(publicUrl: string) {
    try {
      const { data: analyzeData, error: analyzeError } = await supabase.functions
        .invoke('analyze-design', {
          body: { imageUrl: publicUrl },
        });
        
      if (analyzeError) {
        console.error("Analysis error:", analyzeError);
        throw analyzeError;
      }
      
      console.log("Analysis results:", analyzeData);
      
      // Extract the feedback from Claude's response
      if (analyzeData && analyzeData.result && analyzeData.result.content) {
        const content = analyzeData.result.content[0];
        if (content && content.type === 'text') {
          try {
            const jsonData = JSON.parse(content.text);
            
            // Format the data for our feedback system
            const formattedFeedback = [];
            
            // Add strengths as positive feedback
            if (jsonData.strengths) {
              jsonData.strengths.forEach((strength, index) => {
                formattedFeedback.push({
                  id: index + 1,
                  type: "positive",
                  title: strength.title,
                  description: strength.description
                });
              });
            }
            
            // Add issues as improvement feedback
            if (jsonData.issues) {
              jsonData.issues.forEach((issue, index) => {
                formattedFeedback.push({
                  id: formattedFeedback.length + 1,
                  type: "improvement",
                  title: issue.issue,
                  priority: issue.priority,
                  description: issue.recommendation,
                  location: issue.location,
                  principle: issue.principle,
                  technical_details: issue.technical_details
                });
              });
            }
            
            return formattedFeedback;
          } catch (parseError) {
            console.error("Error parsing JSON from Claude:", parseError);
            // Fallback to dummy data if parsing fails
            return generateDummyFeedback();
          }
        }
      }
      
      return generateDummyFeedback();
    } catch (analyzeError) {
      console.error("Error calling analyze-design function:", analyzeError);
      // Fallback to dummy data if analysis fails
      return generateDummyFeedback();
    }
  }

  const generateDummyFeedback = () => {
    return [
      {
        id: 1,
        type: "positive",
        title: "Clean layout",
        description: "The layout is well-structured and organized which makes information easy to scan."
      },
      {
        id: 2,
        type: "positive",
        title: "Good use of white space",
        description: "The spacing between elements is consistent and provides good visual separation."
      },
      {
        id: 3,
        type: "improvement",
        title: "Low contrast buttons",
        priority: "high",
        description: "Some buttons have low contrast which makes them difficult to see for users with visual impairments.",
        location: { x: 250, y: 440 },
        principle: "Accessibility",
        technical_details: "Consider using a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text."
      },
      {
        id: 4,
        type: "improvement",
        title: "Missing form labels",
        priority: "medium",
        description: "Form elements should have visible labels to improve accessibility.",
        location: { x: 300, y: 530 },
        principle: "Accessibility",
        technical_details: "Add <label> elements associated with form controls using 'for' attribute."
      }
    ];
  };

  return {
    isUploading,
    currentStage,
    analyzeImage,
    analyzeUrl
  };
};
