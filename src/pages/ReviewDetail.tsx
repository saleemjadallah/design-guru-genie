
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/layout/Navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AnnotationCanvas } from "@/components/AnnotationCanvas";
import { FeedbackPanel } from "@/components/FeedbackPanel";
import { Overview } from "@/components/analysis/Overview";

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
  feedback: string | any; // Update type to accept both string and JSON
  created_at: string;
  updated_at: string;
  user_id?: string;
};

const ReviewDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [review, setReview] = useState<SavedReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedbackItems, setFeedbackItems] = useState<Feedback[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<number | null>(null);
  
  useEffect(() => {
    const fetchReviewDetails = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session?.user) {
          navigate("/");
          toast({
            title: "Authentication required",
            description: "Please sign in to view review details",
            variant: "destructive",
          });
          return;
        }

        const { data, error } = await supabase
          .from('saved_reviews')
          .select('*')
          .eq('id', id)
          .single();

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
        
        // Parse the feedback JSON
        try {
          // Handle both cases - if feedback is already an object or still a string
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
  }, [id, navigate]);

  // Filter feedback items
  const positiveFeatures = feedbackItems.filter(f => f.type === "positive");
  const issues = feedbackItems.filter(f => f.type === "improvement");

  // Check if this is a URL analysis (no real image, just a placeholder)
  const isUrlAnalysis = review?.image_url?.startsWith('data:image/svg+xml');

  const getIssueCountByPriority = (priority: string) => {
    return issues.filter(issue => issue.priority === priority).length;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50 pt-16">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse text-neutral-500">Loading review details...</div>
          </div>
        ) : review ? (
          <>
            <div className="flex items-center mb-6">
              <button 
                className="mr-4 text-neutral-600 hover:text-neutral-900"
                onClick={() => navigate("/saved-reviews")}
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">{review.title}</h1>
                <p className="text-sm text-neutral-500">
                  Saved on {formatDate(review.created_at)}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <Overview 
                positiveFeatures={positiveFeatures}
                getIssueCountByPriority={getIssueCountByPriority}
                isUrlAnalysis={isUrlAnalysis}
              />

              {isUrlAnalysis ? (
                // URL Analysis Layout - Full-width feedback panel
                <div className="bg-white rounded-lg shadow-sm">
                  <FeedbackPanel 
                    feedback={issues} 
                    strengths={positiveFeatures}
                    onSave={() => {}}
                    selectedIssue={selectedIssue}
                    onIssueSelect={setSelectedIssue}
                    isUrlAnalysis={true}
                  />
                </div>
              ) : (
                // Image Analysis Layout - Split view with annotations
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="lg:w-3/5">
                    <div className="bg-white rounded-lg shadow-sm p-4">
                      <div className="text-center text-sm font-medium text-neutral-500 mb-4">
                        With AI Annotations
                      </div>
                      {review.image_url && (
                        <AnnotationCanvas
                          image={review.image_url}
                          onSave={() => {}}
                          annotations={issues
                            .filter(f => f.location)
                            .map(f => ({
                              id: f.id || 0,
                              x: f.location?.x || 0,
                              y: f.location?.y || 0,
                              priority: f.priority || "medium"
                            }))}
                          selectedIssue={selectedIssue}
                          onIssueSelect={setSelectedIssue}
                        />
                      )}
                    </div>
                  </div>

                  <div className="lg:w-2/5">
                    <FeedbackPanel 
                      feedback={issues} 
                      strengths={positiveFeatures}
                      onSave={() => {}}
                      selectedIssue={selectedIssue}
                      onIssueSelect={setSelectedIssue}
                    />
                  </div>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default ReviewDetail;
