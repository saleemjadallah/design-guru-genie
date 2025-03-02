import { AnnotationCanvas } from "@/components/AnnotationCanvas";
import { FeedbackPanel } from "@/components/feedback/FeedbackPanel";
import { Overview } from "@/components/analysis/Overview";
import { useState } from "react";
import { ImplementationGuidePage } from "@/components/implementation/ImplementationGuidePage";
import { ImplementationFeedback } from "@/components/implementation/types";

type Feedback = ImplementationFeedback;

interface ReviewContentProps {
  review: {
    id: string;
    title: string;
    image_url: string;
    feedback: string | any;
    created_at: string;
    updated_at: string;
    user_id?: string;
  };
  positiveFeatures: Feedback[];
  issues: Feedback[];
  selectedIssue: number | null;
  setSelectedIssue: (id: number | null) => void;
  getIssueCountByPriority: (priority: string) => number;
  isUrlAnalysis: boolean;
}

export const ReviewContent = ({
  review,
  positiveFeatures,
  issues,
  selectedIssue,
  setSelectedIssue,
  getIssueCountByPriority,
  isUrlAnalysis
}: ReviewContentProps) => {
  const [isImplementationGuideOpen, setIsImplementationGuideOpen] = useState(false);

  const handleViewAllImplementation = () => {
    setSelectedIssue(null);
    setIsImplementationGuideOpen(true);
  };

  const handleCloseImplementationGuide = () => {
    setIsImplementationGuideOpen(false);
  };

  const handleViewSingleImplementation = (id: number) => {
    console.log("Viewing implementation for issue:", id);
    setSelectedIssue(id);
    setIsImplementationGuideOpen(true);
  };

  const createDisplayNumberMap = (issues) => {
    const displayNumberMap = new Map<number, number>();
    const sortedIssues = [...issues].sort((a, b) => {
      const priorityOrder = { high: 1, medium: 2, low: 3, undefined: 4 };
      const aPriority = a.priority || "undefined";
      const bPriority = b.priority || "undefined";
      
      return (priorityOrder[aPriority as keyof typeof priorityOrder]) - 
             (priorityOrder[bPriority as keyof typeof priorityOrder]);
    });
    
    sortedIssues.forEach((issue, index) => {
      if (issue.id !== undefined) {
        displayNumberMap.set(issue.id, index + 1);
      }
    });
    
    return displayNumberMap;
  };

  return (
    <div className="space-y-6">
      {isImplementationGuideOpen ? (
        <ImplementationGuidePage 
          issues={issues} 
          onClose={handleCloseImplementationGuide}
          selectedIssue={selectedIssue}
        />
      ) : (
        <>
          <Overview 
            positiveFeatures={positiveFeatures}
            getIssueCountByPriority={getIssueCountByPriority}
            isUrlAnalysis={isUrlAnalysis}
          />

          {isUrlAnalysis ? (
            <div className="bg-white rounded-lg shadow-sm">
              <FeedbackPanel 
                feedback={issues} 
                strengths={positiveFeatures}
                onSave={() => {}}
                selectedIssue={selectedIssue}
                onIssueSelect={setSelectedIssue}
                isUrlAnalysis={true}
                onViewAllImplementation={handleViewAllImplementation}
                onViewSingleImplementation={handleViewSingleImplementation}
              />
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="lg:w-3/5">
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="text-center text-sm font-medium text-neutral-500 mb-4">
                    With AI Annotations
                  </div>
                  {review.image_url && (
                    <AnnotationCanvas
                      image={review.image_url}
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
                      displayNumberMap={createDisplayNumberMap(issues)}
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
                  onViewAllImplementation={handleViewAllImplementation}
                  onViewSingleImplementation={handleViewSingleImplementation}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
