import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { FeedbackActionButtons } from "./FeedbackActionButtons";
import { FeedbackIssueList } from "./FeedbackIssueList";
import { SaveAnalysisInput } from "./SaveAnalysisInput";

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
  strengths?: Feedback[];
  onSave?: () => void;
  onIssueSelect?: (id: number | null) => void;
  onViewAllImplementation?: () => void;
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
  onViewAllImplementation,
  isUrlAnalysis = false
}: FeedbackPanelProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [savedTitle, setSavedTitle] = useState("");
  const titleInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const displayedIssues = filteredIssues || feedback.filter(f => f.type === "improvement");

  const handleIssueSelect = (id: number | null) => {
    if (onIssueSelect) {
      onIssueSelect(id);
    } else if (setSelectedIssue) {
      setSelectedIssue(id);
    }
  };

  React.useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
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
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast({
        title: "Analysis saved",
        description: "Your design analysis has been saved successfully.",
      });
      
      navigate('/saved-reviews');
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

  const exportPDF = async () => {
    setIsExporting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      toast({
        title: "PDF exported",
        description: "Your design analysis has been exported to PDF successfully.",
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "Export failed",
        description: "There was an error exporting your analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-xl">Design Issues</h2>
        <FeedbackActionButtons
          onExportPDF={exportPDF}
          onSaveAnalysis={saveAnalysis}
          isExporting={isExporting}
          isSaving={isSaving}
          analysisId={analysisId}
        />
      </div>

      {user && setFeedback && (
        <SaveAnalysisInput
          savedTitle={savedTitle}
          setSavedTitle={setSavedTitle}
          titleInputRef={titleInputRef}
        />
      )}

      <FeedbackIssueList
        issues={displayedIssues}
        selectedIssue={selectedIssue}
        onIssueSelect={handleIssueSelect}
        onPriorityClick={setFeedback ? handlePriorityClick : undefined}
        onViewAllImplementation={onViewAllImplementation}
      />
    </div>
  );
};
