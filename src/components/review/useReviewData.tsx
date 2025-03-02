
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Feedback, SavedReview } from "./types";
import { parseFeedback } from "./feedback-parser";
import { fetchReviewById } from "./review-service";

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

        // Fetch the review from the database
        try {
          const data = await fetchReviewById(reviewId);
          setReview(data);
          
          // Parse the feedback data
          const parsedFeedbackItems = parseFeedback(data);
          setFeedbackItems(parsedFeedbackItems);
          
        } catch (dbError: any) {
          console.error("Database operation failed:", dbError);
          setError(dbError.message || "Database operation failed");
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
