
import { useParams } from "react-router-dom";
import { Navigation } from "@/components/layout/navigation";
import { ReviewHeader } from "@/components/review/ReviewHeader";
import { ReviewContent } from "@/components/review/ReviewContent";
import { ReviewLoader } from "@/components/review/ReviewLoader";
import { useReviewData } from "@/components/review/useReviewData";

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
