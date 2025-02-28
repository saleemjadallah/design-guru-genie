
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Check, LineChart, Save } from "lucide-react";

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

interface FeedbackPanelProps {
  feedback: Feedback[];
  filteredIssues?: Feedback[];
  selectedIssue: number | null;
  setSelectedIssue?: (id: number | null) => void;
  setFeedback?: (feedback: Feedback[]) => void;
  analysisId?: string | null;
  // For ReviewDetail.tsx compatibility
  strengths?: Feedback[];
  onSave?: () => void;
  onIssueSelect?: (id: number | null) => void;
  isUrlAnalysis?: boolean;
}

export const FeedbackPanel = ({
  feedback,
  filteredIssues,
  selectedIssue,
  setSelectedIssue,
  setFeedback,
  analysisId,
  strengths,
  onSave,
  onIssueSelect,
  isUrlAnalysis = false
}: FeedbackPanelProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [savedTitle, setSavedTitle] = useState("");
  const titleInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Use either the provided filteredIssues or filter improvement types from feedback
  const displayedIssues = filteredIssues || feedback.filter(f => f.type === "improvement");
  
  // Use the appropriate issue selection handler
  const handleIssueSelect = (id: number | null) => {
    if (onIssueSelect) {
      onIssueSelect(id);
    } else if (setSelectedIssue) {
      setSelectedIssue(id);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      // Here you would normally check if the user has an active subscription
      // For now, we'll simulate that based on authentication status
      setIsSubscribed(!!session?.user);
    };
    
    checkAuth();
  }, []);

  const handlePriorityClick = (id: number, newPriority: 'low' | 'medium' | 'high') => {
    if (!setFeedback) return;
    
    setFeedback(
      feedback.map((item) =>
        item.id === id
          ? { ...item, priority: newPriority }
          : item
      )
    );
  };

  const getPriorityClasses = (priority?: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-orange-100 text-orange-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-neutral-100 text-neutral-800";
    }
  };

  const saveAnalysis = async () => {
    if (onSave) {
      onSave();
      return;
    }
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save your analysis.",
        variant: "destructive",
      });
      return;
    }

    if (!savedTitle.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your saved analysis.",
        variant: "destructive",
      });
      titleInputRef.current?.focus();
      return;
    }

    setIsSaving(true);
    try {
      // Simulate saving to database 
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast({
        title: "Analysis saved",
        description: "Your design analysis has been saved successfully.",
      });
      
      // Simulate navigating to saved reviews
      // navigate('/saved-reviews');
    } catch (error) {
      console.error("Error saving analysis:", error);
      toast({
        title: "Save failed",
        description: "There was an error saving your analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleGoToFollowUp = () => {
    if (analysisId) {
      navigate(`/follow-up/${analysisId}`);
    } else {
      toast({
        title: "Error",
        description: "Could not find analysis ID.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-xl">Design Issues</h2>
        <div className="space-x-2">
          {user && analysisId && (
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={handleGoToFollowUp}
            >
              <LineChart className="w-4 h-4" />
              <span>Follow-Up</span>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => saveAnalysis()}
            disabled={isSaving}
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Saving..." : "Save"}</span>
          </Button>
        </div>
      </div>

      {user && setFeedback && (
        <div className="mb-4">
          <input
            ref={titleInputRef}
            type="text"
            value={savedTitle}
            onChange={(e) => setSavedTitle(e.target.value)}
            placeholder="Enter a title to save this analysis"
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      )}

      <div className="space-y-4 overflow-y-auto max-h-[600px] pr-2">
        {displayedIssues.length === 0 ? (
          <div className="text-center py-10 text-neutral-500">
            No issues found for this filter criteria.
          </div>
        ) : (
          displayedIssues.map((issue) => (
            <div
              key={issue.id}
              className={`border rounded-lg p-4 transition-all ${
                selectedIssue === issue.id
                  ? "border-accent ring-1 ring-accent"
                  : "border-neutral-200 hover:border-neutral-300"
              }`}
              onClick={() => handleIssueSelect(issue.id ?? null)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-neutral-900">
                  {issue.title}
                </h3>
                <div
                  className={`text-xs px-2 py-0.5 rounded-full ${getPriorityClasses(
                    issue.priority
                  )}`}
                >
                  {issue.priority || "unset"} priority
                </div>
              </div>

              <p className="text-neutral-600 text-sm mb-3">
                {issue.description}
              </p>

              {issue.principle && (
                <div className="text-xs text-neutral-500 mb-3">
                  <span className="font-medium">Principle: </span>
                  {issue.principle}
                </div>
              )}

              {setFeedback && (
                <div className="flex flex-wrap gap-1 mt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePriorityClick(issue.id || 0, "low");
                    }}
                    className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                      issue.priority === "low"
                        ? "bg-green-100 text-green-800 border-green-200"
                        : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                    }`}
                  >
                    {issue.priority === "low" && (
                      <Check className="inline w-3 h-3 mr-1" />
                    )}
                    Low
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePriorityClick(issue.id || 0, "medium");
                    }}
                    className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                      issue.priority === "medium"
                        ? "bg-orange-100 text-orange-800 border-orange-200"
                        : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                    }`}
                  >
                    {issue.priority === "medium" && (
                      <Check className="inline w-3 h-3 mr-1" />
                    )}
                    Medium
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePriorityClick(issue.id || 0, "high");
                    }}
                    className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                      issue.priority === "high"
                        ? "bg-red-100 text-red-800 border-red-200"
                        : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                    }`}
                  >
                    {issue.priority === "high" && (
                      <Check className="inline w-3 h-3 mr-1" />
                    )}
                    High
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      {/* In-Analysis Subscription Prompt */}
      {displayedIssues.length > 0 && !isSubscribed && !isUrlAnalysis && (
        <div className="border-t border-gray-200 mt-8 pt-6">
          <div className="flex items-start">
            <div className="flex-shrink-0 bg-blue-100 rounded-full p-1">
              <LineChart className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <h3 className="font-medium text-gray-900">Track Your Design Evolution</h3>
              <p className="text-gray-600 mt-1">
                After implementing our recommendations, come back for a follow-up analysis to see how much you've improved.
              </p>
              <div className="mt-3 flex items-center">
                <span className="text-sm font-medium text-blue-600 mr-2">Premium Feature</span>
                <Button 
                  className="text-sm bg-accent hover:bg-accent/90"
                  size="sm"
                >
                  Subscribe to Unlock
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
