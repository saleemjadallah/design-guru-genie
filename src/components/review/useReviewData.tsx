
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Json } from "@/integrations/supabase/types";

type Feedback = {
  type: "positive" | "improvement";
  title: string;
  description: string;
  priority?: "low" | "medium" | "high";
  location?: { x: number; y: number };
  id?: number;
  principle?: string;
  technical_details?: string;
};

type SavedReview = {
  id: string;
  title: string;
  image_url: string;
  feedback: string | any;
  created_at: string;
  updated_at: string;
  user_id?: string;
};

// Helper to type check Claude AI response structure
interface ClaudeResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
}

export const useReviewData = (reviewId: string | undefined) => {
  const navigate = useNavigate();
  const [review, setReview] = useState<SavedReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedbackItems, setFeedbackItems] = useState<Feedback[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  
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
  
  useEffect(() => {
    const fetchReviewDetails = async () => {
      try {
        if (!reviewId) {
          throw new Error("Review ID is required");
        }

        // Validate UUID format - This is a basic validation, not comprehensive
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(reviewId)) {
          throw new Error(`Invalid review ID format: ${reviewId}`);
        }

        // Fetch the review from the database
        try {
          const { data, error: dbError } = await supabase
            .from('saved_reviews')
            .select('*')
            .eq('id', reviewId)
            .maybeSingle();

          if (dbError) {
            console.error("Database error:", dbError);
            setError("Database error: " + dbError.message);
            return;
          }
          
          if (!data) {
            setError("Review not found");
            return;
          }

          setReview(data);
          
          try {
            let parsed;
            // Check if feedback is a string that needs parsing
            if (typeof data.feedback === 'string') {
              parsed = JSON.parse(data.feedback);
            } 
            // Check if feedback is an object
            else if (data.feedback && typeof data.feedback === 'object') {
              // Check if this matches Claude's response format
              if (isClaudeResponse(data.feedback)) {
                try {
                  const claudeResponse = data.feedback as ClaudeResponse;
                  // Make sure content[0].text exists and is a string
                  if (claudeResponse.content &&
                      claudeResponse.content[0] &&
                      claudeResponse.content[0].text) {
                    
                    const claudeContent = JSON.parse(claudeResponse.content[0].text);
                    parsed = [];
                    
                    // Process strengths
                    if (claudeContent.strengths) {
                      claudeContent.strengths.forEach((strength: any, index: number) => {
                        parsed.push({
                          id: index + 1,
                          type: "positive",
                          title: strength.title,
                          description: strength.description,
                          location: strength.location || null
                        });
                      });
                    }
                    
                    // Process issues
                    if (claudeContent.issues) {
                      claudeContent.issues.forEach((issue: any, index: number) => {
                        parsed.push({
                          id: parsed.length + 1,
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
                  }
                } catch (parseError) {
                  console.error("Error parsing Claude response:", parseError);
                  // Handle parsing error - use the object as is if possible
                  if (Array.isArray(data.feedback)) {
                    parsed = data.feedback;
                  }
                }
              } else {
                // Already in the correct format or array
                parsed = data.feedback;
              }
            } 
            
            if (Array.isArray(parsed)) {
              setFeedbackItems(parsed);
            } else {
              console.error("Feedback is not an array:", parsed);
              setError("Invalid feedback format");
            }
          } catch (parseError) {
            console.error("Error parsing feedback:", parseError);
            setError("Error parsing feedback data");
          }
        } catch (dbError) {
          console.error("Database operation failed:", dbError);
          setError("Database operation failed");
        }
      } catch (error: any) {
        console.error("Error fetching review details:", error);
        setError(error.message || "Failed to load review");
      } finally {
        setLoading(false);
      }
    };

    fetchReviewDetails();
  }, [reviewId, navigate]);

  const positiveFeatures = feedbackItems.filter(f => f.type === "positive");
  const issues = feedbackItems.filter(f => f.type === "improvement");

  const isUrlAnalysis = review?.image_url?.startsWith('data:image/svg+xml');

  const getIssueCountByPriority = (priority: string) => {
    return issues.filter(issue => issue.priority === priority).length;
  };

  return {
    review,
    loading,
    feedbackItems,
    selectedIssue,
    setSelectedIssue,
    positiveFeatures,
    issues,
    isUrlAnalysis,
    getIssueCountByPriority,
    error
  };
};
