
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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

export const useReviewData = (reviewId: string | undefined) => {
  const navigate = useNavigate();
  const [review, setReview] = useState<SavedReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedbackItems, setFeedbackItems] = useState<Feedback[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchReviewDetails = async () => {
      try {
        if (!reviewId) {
          throw new Error("Review ID is required");
        }

        // Fetch the review from the database without validation
        try {
          const { data, error } = await supabase
            .from('saved_reviews')
            .select('*')
            .eq('id', reviewId)
            .maybeSingle();

          if (error) {
            console.error("Database error:", error);
            setError("Database error: " + error.message);
            return;
          }
          
          if (!data) {
            setError("Review not found");
            return;
          }

          setReview(data);
          
          try {
            const parsedFeedback = typeof data.feedback === 'string' 
              ? JSON.parse(data.feedback) 
              : data.feedback;
            
            setFeedbackItems(parsedFeedback);
          } catch (parseError) {
            console.error("Error parsing feedback:", parseError);
            setError("Error parsing feedback data");
          }
        } catch (dbError) {
          console.error("Database operation failed:", dbError);
          setError("Database operation failed");
        }
      } catch (error) {
        console.error("Error fetching review details:", error);
        setError("Failed to load review");
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
