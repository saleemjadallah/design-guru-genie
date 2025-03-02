
import { useParams } from "react-router-dom";
import { Navigation } from "@/components/layout/navigation";
import { ReviewHeader } from "@/components/review/ReviewHeader";
import { ReviewContent } from "@/components/review/ReviewContent";
import { ReviewLoader } from "@/components/review/ReviewLoader";
import { useReviewData } from "@/components/review/useReviewData";
import { AlertCircle } from "lucide-react";

const ReviewDetail = () => {
  const { id } = useParams<{ id: string }>();
  const {
    review,
    loading,
    positiveFeatures,
    issues,
    selectedIssue,
    setSelectedIssue,
    isUrlAnalysis,
    getIssueCountByPriority
  } = useReviewData(id);

  return (
    <div className="min-h-screen bg-neutral-50 pt-16">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ReviewLoader loading={loading} />
        
        {!loading && !review && (
          <div className="bg-red-400 text-white p-8 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold mb-2 flex items-center">
              <AlertCircle className="mr-2" size={24} />
              Failed to load review
            </h2>
            <p className="text-xl">There was an error loading the review details</p>
          </div>
        )}
        
        {!loading && review && (
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
