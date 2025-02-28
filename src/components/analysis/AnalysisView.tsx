
import { useState, useEffect } from "react";
import { FeedbackPanel } from "@/components/FeedbackPanel";
import { ProcessingState } from "@/components/ProcessingState";
import { FilterControls } from "@/components/analysis/FilterControls";
import { Overview } from "@/components/analysis/Overview";
import { ArrowLeft } from "lucide-react";
import { FollowUpPrompt } from "@/components/analysis/FollowUpPrompt";
import { supabase } from "@/integrations/supabase/client";

interface Feedback {
  type: "positive" | "improvement";
  title: string;
  description: string;
  priority?: "low" | "medium" | "high";
  location?: { x: number; y: number };
  id?: number;
  principle?: string;
  technical_details?: string;
}

interface AnalysisViewProps {
  isAnalyzing: boolean;
  analysisStage: 0 | 1 | 2 | 3;
  uploadedImage: string | null;
  feedback: Feedback[];
  selectedIssue: number | null;
  priorityFilter: 'all' | 'high' | 'medium' | 'low';
  positiveFeatures: Feedback[];
  filteredIssues: Feedback[];
  onBack: () => void;
  setPriorityFilter: (filter: 'all' | 'high' | 'medium' | 'low') => void;
  setSelectedIssue: (id: number | null) => void;
  setFeedback: (feedback: Feedback[]) => void;
  getIssueCountByPriority: (priority: string) => number;
}

export const AnalysisView = ({
  isAnalyzing,
  analysisStage,
  uploadedImage,
  feedback,
  selectedIssue,
  priorityFilter,
  positiveFeatures,
  filteredIssues,
  onBack,
  setPriorityFilter,
  setSelectedIssue,
  setFeedback,
  getIssueCountByPriority
}: AnalysisViewProps) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [analysisId, setAnalysisId] = useState<string | null>(null);

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      // Here you would normally check if the user has an active subscription
      // For now, we'll simulate that the user is not subscribed
      const { data: { session } } = await supabase.auth.getSession();
      setIsSubscribed(!!session);
      
      // Generate a temporary analysis ID for demo purposes
      setAnalysisId(crypto.randomUUID());
    };

    checkSubscriptionStatus();
  }, []);

  if (isAnalyzing) {
    return (
      <div className="container py-12">
        <ProcessingState stage={analysisStage} />
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={onBack}
          className="flex items-center text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span>Back</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="bg-white p-4 rounded-xl shadow-sm overflow-hidden mb-8">
            <h2 className="font-semibold text-xl mb-4">Original Design</h2>
            {uploadedImage && (
              <div className="relative rounded-lg overflow-hidden border border-neutral-200">
                <img
                  src={uploadedImage}
                  alt="Uploaded design"
                  className="w-full h-auto"
                />
              </div>
            )}
          </div>

          <Overview
            positiveFeatures={positiveFeatures}
            issueCount={feedback.filter(f => f.type === "improvement").length}
            getIssueCountByPriority={getIssueCountByPriority}
          />
          
          {/* Follow-Up Analysis CTA */}
          {analysisStage === 3 && !isAnalyzing && (
            <FollowUpPrompt isSubscribed={isSubscribed} />
          )}
        </div>

        <div>
          <FilterControls
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            issueCountHigh={getIssueCountByPriority("high")}
            issueCountMedium={getIssueCountByPriority("medium")}
            issueCountLow={getIssueCountByPriority("low")}
          />

          <FeedbackPanel
            feedback={feedback}
            filteredIssues={filteredIssues}
            selectedIssue={selectedIssue}
            setSelectedIssue={setSelectedIssue}
            setFeedback={setFeedback}
            analysisId={analysisId}
          />
        </div>
      </div>
    </div>
  );
};
