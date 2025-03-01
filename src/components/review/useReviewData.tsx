
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

// Demo review data for when id is "demo-analysis"
const demoReview: SavedReview = {
  id: "demo-analysis",
  title: "Demo Design Review",
  image_url: "/lovable-uploads/d8111ffc-aa28-4e49-a13a-246b7ce4b6b9.png",
  feedback: JSON.stringify([
    {
      type: "positive",
      title: "Clean Layout",
      description: "The design has a clean and organized layout with good use of whitespace."
    },
    {
      type: "positive",
      title: "Consistent Color Scheme",
      description: "Colors are used consistently throughout the interface."
    },
    {
      type: "improvement",
      title: "Low Contrast Text",
      description: "Some text elements have insufficient contrast with the background.",
      priority: "high",
      location: { x: 250, y: 120 }
    },
    {
      type: "improvement",
      title: "Inconsistent Button Styles",
      description: "Button styles vary across the interface, causing visual inconsistency.",
      priority: "medium",
      location: { x: 400, y: 300 }
    },
    {
      type: "improvement",
      title: "Mobile Responsiveness",
      description: "Layout breaks on smaller screens and needs responsive adjustments.",
      priority: "high"
    }
  ]),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export const useReviewData = (reviewId: string | undefined) => {
  const navigate = useNavigate();
  const [review, setReview] = useState<SavedReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedbackItems, setFeedbackItems] = useState<Feedback[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<number | null>(null);
  
  useEffect(() => {
    const fetchReviewDetails = async () => {
      try {
        // If the ID is "demo-analysis", use the demo data
        if (reviewId === "demo-analysis") {
          setReview(demoReview);
          
          try {
            const parsedFeedback = typeof demoReview.feedback === 'string' 
              ? JSON.parse(demoReview.feedback) 
              : demoReview.feedback;
            
            setFeedbackItems(parsedFeedback);
          } catch (parseError) {
            console.error("Error parsing demo feedback:", parseError);
          }
          
          setLoading(false);
          return;
        }
        
        // For actual database reviews, fetch from Supabase
        const { data, error } = await supabase
          .from('saved_reviews')
          .select('*')
          .eq('id', reviewId)
          .maybeSingle(); // Using maybeSingle instead of single to avoid errors if no record found

        if (error) throw error;
        
        if (!data) {
          navigate("/saved-reviews");
          toast({
            title: "Review not found",
            description: "The requested review could not be found",
            variant: "destructive",
          });
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
          toast({
            title: "Error parsing feedback",
            description: "There was an error loading the review details",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching review details:", error);
        toast({
          title: "Failed to load review",
          description: "There was an error loading the review details",
          variant: "destructive",
        });
        navigate("/saved-reviews");
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
    getIssueCountByPriority
  };
};
