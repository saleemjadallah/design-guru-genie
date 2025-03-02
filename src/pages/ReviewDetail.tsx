
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/layout/navigation";
import { ReviewHeader } from "@/components/review/ReviewHeader";
import { ReviewContent } from "@/components/review/ReviewContent";
import { ReviewLoader } from "@/components/review/ReviewLoader";
import { useReviewData } from "@/components/review/useReviewData";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const ReviewDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    review,
    loading,
    positiveFeatures,
    issues,
    selectedIssue,
    setSelectedIssue,
    isUrlAnalysis,
    getIssueCountByPriority,
    error
  } = useReviewData(id);

  // Check for invalid routes and redirect accordingly
  useEffect(() => {
    if (id === "demo-analysis") {
      toast({
        title: "Demo analysis removed",
        description: "The demo analysis feature has been removed. Please upload a design to analyze.",
        variant: "destructive",
      });
      navigate("/saved-reviews");
    }
  }, [id, navigate]);

  const handleBackToSavedReviews = () => {
    navigate("/saved-reviews");
  };

  return (
    <div className="min-h-screen bg-neutral-50 pt-16">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ReviewLoader loading={loading} />
        
        {!loading && (error || !review) && (
          <div className="bg-red-500 text-white p-8 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold mb-2 flex items-center">
              <AlertCircle className="mr-2" size={24} />
              Failed to load review
            </h2>
            <p className="text-xl mb-4">There was an error loading the review details</p>
            {error && <p className="mb-4 text-white/80">{error}</p>}
            <Button 
              variant="outline" 
              className="bg-white text-red-500 hover:bg-white/90"
              onClick={handleBackToSavedReviews}
            >
              Back to Saved Reviews
            </Button>
          </div>
        )}
        
        {!loading && !error && review && (
          <>
            <ReviewHeader title={review.title} created_at={review.created_at} />
            
            <ReviewContent
              review={review}
              positiveFeatures={positiveFeatures}
              issues={issues}
              selectedIssue={selectedIssue}
              setSelectedIssue={setSelectedIssue}
              getIssueCountByPriority={getIssueCountByPriority}
              isUrlAnalysis={isUrlAnalysis}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ReviewDetail;
