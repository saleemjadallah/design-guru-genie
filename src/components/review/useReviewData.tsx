
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

// Demo data for the demo-analysis route
const DEMO_REVIEW: SavedReview = {
  id: "demo-analysis",
  title: "Demo Analysis",
  image_url: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAwIiBoZWlnaHQ9IjgwMCIgdmlld0JveD0iMCAwIDEyMDAgODAwIiBmaWxsPSJub25lIj48cmVjdCB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI4MDAiIGZpbGw9IiNGOEY5RkEiLz48cmVjdCB4PSIxNTAiIHk9IjEwMCIgd2lkdGg9IjkwMCIgaGVpZ2h0PSI2MDAiIGZpbGw9IiNGRkZGRkYiIHN0cm9rZT0iI0U5RUNFRiIvPjxyZWN0IHg9IjE1MCIgeT0iMTAwIiB3aWR0aD0iOTAwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjhGOUZBIiBzdHJva2U9IiNFOUVDRUYiLz48cmVjdCB4PSIxODAiIHk9IjEzMCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIyMCIgcng9IjQiIGZpbGw9IiMwMDY2RkYiLz48cmVjdCB4PSIzMDAiIHk9IjEzMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjIwIiByeD0iNCIgZmlsbD0iI0U5RUNFRiIvPjxyZWN0IHg9IjQwMCIgeT0iMTMwIiB3aWR0aD0iODAiIGhlaWdodD0iMjAiIHJ4PSI0IiBmaWxsPSIjRTlFQ0VGIi8+PHJlY3QgeD0iNTAwIiB5PSIxMzAiIHdpZHRoPSI4MCIgaGVpZ2h0PSIyMCIgcng9IjQiIGZpbGw9IiNFOUVDRUYiLz48cmVjdCB4PSI4NTAiIHk9IjEzMCIgd2lkdGg9IjE3MCIgaGVpZ2h0PSIyMCIgcng9IjQiIGZpbGw9IiNFOUVDRUYiLz48cmVjdCB4PSIyMDAiIHk9IjIyMCIgd2lkdGg9IjQ1MCIgaGVpZ2h0PSIzNSIgcng9IjQiIGZpbGw9IiMzMzMzMzMiLz48cmVjdCB4PSIyMDAiIHk9IjI4MCIgd2lkdGg9IjgwMCIgaGVpZ2h0PSIyNSIgcng9IjQiIGZpbGw9IiNFOUVDRUYiLz48cmVjdCB4PSIyMDAiIHk9IjMyMCIgd2lkdGg9IjcwMCIgaGVpZ2h0PSIyNSIgcng9IjQiIGZpbGw9IiNFOUVDRUYiLz48cmVjdCB4PSIyMDAiIHk9IjM2MCIgd2lkdGg9Ijc1MCIgaGVpZ2h0PSIyNSIgcng9IjQiIGZpbGw9IiNFOUVDRUYiLz48cmVjdCB4PSIyMDAiIHk9IjQ0MCIgd2lkdGg9IjI1MCIgaGVpZ2h0PSIyNSIgcng9IjQiIGZpbGw9IiMwMDY2RkYiLz48cmVjdCB4PSI0ODAiIHk9IjQ0MCIgd2lkdGg9IjIyMCIgaGVpZ2h0PSIyNSIgcng9IjQiIGZpbGw9IiNFOUVDRUYiLz48cmVjdCB4PSIyMDAiIHk9IjUwMCIgd2lkdGg9IjgwMCIgaGVpZ2h0PSIxIiBmaWxsPSIjRTlFQ0VGIi8+PHJlY3QgeD0iMjAwIiB5PSI1MzAiIHdpZHRoPSIxNTAiIGhlaWdodD0iMjUiIHJ4PSI0IiBmaWxsPSIjRTlFQ0VGIi8+PHJlY3QgeD0iMjAwIiB5PSI1NzAiIHdpZHRoPSI2NTAiIGhlaWdodD0iMjUiIHJ4PSI0IiBmaWxsPSIjRTlFQ0VGIi8+PHJlY3QgeD0iMjAwIiB5PSI2MTAiIHdpZHRoPSI3MDAiIGhlaWdodD0iMjUiIHJ4PSI0IiBmaWxsPSIjRTlFQ0VGIi8+PC9zdmc+",
  feedback: [
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
  ],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
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

        // Special handling for demo-analysis
        if (reviewId === "demo-analysis") {
          console.log("Loading demo analysis");
          setReview(DEMO_REVIEW);
          setFeedbackItems(DEMO_REVIEW.feedback);
          setLoading(false);
          return;
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
