
import { useState, useEffect } from "react";
import { FeedbackPanel } from "@/components/FeedbackPanel";
import { ProcessingState } from "@/components/ProcessingState";
import { FilterControls } from "@/components/analysis/FilterControls";
import { Overview } from "@/components/analysis/Overview";
import { ArrowLeft } from "lucide-react";
import { FollowUpPrompt } from "@/components/analysis/FollowUpPrompt";
import { supabase } from "@/integrations/supabase/client";
import { ImplementationGuide } from "@/components/implementation/ImplementationGuide";

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
  isSubscribed?: boolean;
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
  getIssueCountByPriority,
  isSubscribed: propIsSubscribed
}: AnalysisViewProps) => {
  const [isSubscribed, setIsSubscribed] = useState(propIsSubscribed || false);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [showImplementationGuide, setShowImplementationGuide] = useState(false);
  const [currentIssue, setCurrentIssue] = useState<Feedback | null>(null);

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (propIsSubscribed !== undefined) {
        setIsSubscribed(propIsSubscribed);
        return;
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      const isUserSubscribed = session?.user?.user_metadata?.is_subscribed === true;
      setIsSubscribed(!!session && isUserSubscribed);
      
      setAnalysisId(crypto.randomUUID());
    };

    checkSubscriptionStatus();
  }, [propIsSubscribed]);

  useEffect(() => {
    if (selectedIssue !== null) {
      const issue = feedback.find(f => f.id === selectedIssue);
      setCurrentIssue(issue || null);
      setShowImplementationGuide(!!issue);
    } else {
      setCurrentIssue(null);
      setShowImplementationGuide(false);
    }
  }, [selectedIssue, feedback]);

  const handleCloseImplementationGuide = () => {
    setShowImplementationGuide(false);
    setSelectedIssue(null);
  };

  if (isAnalyzing) {
    return (
      <div className="container py-12">
        <ProcessingState currentStage={analysisStage} />
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

      {showImplementationGuide && currentIssue ? (
        <div>
          <ImplementationGuide 
            issues={[currentIssue]} 
            onClose={handleCloseImplementationGuide} 
          />
        </div>
      ) : (
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
              getIssueCountByPriority={getIssueCountByPriority}
            />
            
            {analysisStage === 3 && !isAnalyzing && (
              <FollowUpPrompt isSubscribed={isSubscribed} />
            )}
          </div>

          <div>
            <FilterControls
              priorityFilter={priorityFilter}
              setPriorityFilter={setPriorityFilter}
            />

            <FeedbackPanel
              feedback={feedback}
              filteredIssues={filteredIssues}
              selectedIssue={selectedIssue}
              setSelectedIssue={setSelectedIssue}
              setFeedback={setFeedback}
              analysisId={analysisId}
              onIssueSelect={(id) => {
                setSelectedIssue(id);
                if (id !== null) {
                  const issue = feedback.find(f => f.id === id);
                  if (issue) {
                    setCurrentIssue(issue);
                    setShowImplementationGuide(true);
                  }
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
