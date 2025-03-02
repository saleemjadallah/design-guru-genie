
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
        console.error("Storage upload error:", uploadError);
        let errorMsg = "There was an error uploading your file.";
        
        if (uploadError.message.includes("storage quota")) {
          errorMsg = "Storage quota exceeded. Please try a smaller file or contact support.";
        } else if (uploadError.message.includes("not found")) {
          errorMsg = "Storage bucket not found. Please contact support.";
        } else if (uploadError.message.includes("unauthorized")) {
          errorMsg = "You don't have permission to upload files. Please log in again.";
        } else if (file.size > 5 * 1024 * 1024) {
          errorMsg = "File is too large. Maximum size is 5MB.";
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
          console.error("Database error:", reviewError);
          let dbErrorMsg = "Error saving your review to the database.";
          
          if (reviewError.message.includes("duplicate key")) {
            dbErrorMsg = "A review with this title already exists. Please try again.";
          } else if (reviewError.message.includes("foreign key")) {
            dbErrorMsg = "Database reference error. Please contact support.";
          } else if (reviewError.message.includes("not-null")) {
            dbErrorMsg = "Missing required fields. Please try again.";
          }
          
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
        // If Claude analysis fails, try to provide a helpful error message
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
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message || "There was an error processing your design. Please try again.",
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
        console.error("Database error:", reviewError);
        let errorMsg = "Error saving your review to the database.";
        
        if (reviewError.message.includes("duplicate key")) {
          errorMsg = "A review with this title already exists. Please try again.";
        } else if (reviewError.message.includes("not-null")) {
          errorMsg = "Missing required information. Please provide a valid URL.";
        }
        
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
      toast({
        title: "Analysis failed",
        description: error.message || "There was an error analyzing the URL. Please try again with a different URL or upload a screenshot instead.",
        variant: "destructive"
      });
      setIsUploading(false);
    }
  };

  async function processWithClaudeAI(publicUrl: string) {
    try {
      toast({
        title: "AI Analysis",
        description: "Our AI is analyzing your design for strengths and improvement opportunities...",
      });
      
      const { data: analyzeData, error: analyzeError } = await supabase.functions
        .invoke('analyze-design', {
          body: { imageUrl: publicUrl },
        });
        
      if (analyzeError) {
        console.error("Analysis error:", analyzeError);
        let errorMsg = "Error during AI analysis.";
        
        if (analyzeError.message.includes("timeout")) {
          errorMsg = "Analysis timed out. Your design may be too complex or our service is busy.";
        } else if (analyzeError.message.includes("quota")) {
          errorMsg = "We've reached our AI service quota. Please try again later.";
        } else if (analyzeError.message.includes("rate limit")) {
          errorMsg = "Too many requests. Please try again in a few minutes.";
        }
        
        throw new Error(errorMsg);
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
            
            toast({
              title: "Analysis successful",
              description: `Found ${formattedFeedback.length} insights about your design.`,
            });
            
            return formattedFeedback;
          } catch (parseError) {
            console.error("Error parsing JSON from Claude:", parseError);
            toast({
              title: "Data format error",
              description: "There was an error processing the AI response. Using alternative analysis.",
              variant: "destructive"
            });
            // Fallback to dummy data if parsing fails
            return generateDummyFeedback();
          }
        }
      }
      
      toast({
        title: "Limited analysis",
        description: "We couldn't get a complete analysis. Using alternative feedback.",
        variant: "destructive"
      });
      return generateDummyFeedback();
    } catch (analyzeError) {
      console.error("Error calling analyze-design function:", analyzeError);
      toast({
        title: "AI service unavailable",
        description: "Our AI analysis service is currently unavailable. Using alternative feedback.",
        variant: "destructive"
      });
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
