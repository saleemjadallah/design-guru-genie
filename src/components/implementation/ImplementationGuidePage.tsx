
import React, { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { ImplementationFeedback, TimeInvestmentSummary } from "./types";
import { SingleIssueImplementation } from "./SingleIssueImplementation";
import { calculateTotalTime, processIssues, sortIssuesByPriority } from "./utils";
import { ImplementationGuideHeader } from "./ImplementationGuideHeader";
import { ImplementationTabs, ImplementationTab } from "./ImplementationTabs";
import { ImplementationContent } from "./ImplementationContent";
import { exportResultsAsPdf } from "@/utils/pdf-export";

interface ImplementationGuidePageProps {
  issues: ImplementationFeedback[];
  onClose: () => void;
  selectedIssue?: number | null;
}

export const ImplementationGuidePage = ({ 
  issues, 
  onClose,
  selectedIssue 
}: ImplementationGuidePageProps) => {
  // State for tracking completed items
  const [completedItems, setCompletedItems] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<ImplementationTab>('matrix');
  const [currentView, setCurrentView] = useState<'overview' | 'single-issue'>('overview');
  const [activeIssueId, setActiveIssueId] = useState<number | null>(null);
  
  // Process and sort issues
  const processedIssues = processIssues(issues, completedItems);
  const sortedIssues = sortIssuesByPriority(processedIssues);

  // Toggle completion status
  const toggleCompleted = (id: number) => {
    console.log("Toggling completion for issue:", id);
    setCompletedItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(itemId => itemId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Calculate time investment summary
  const timeInvestmentSummary: TimeInvestmentSummary = {
    quickWins: sortedIssues.filter(issue => 
      issue.impact === "high" && issue.effort === "low").length,
    priorityChanges: sortedIssues.filter(issue => 
      issue.priority === "high" || issue.priority === "medium").length,
    extendedImprovements: sortedIssues.filter(issue => 
      issue.effort === "high").length,
    totalTime: calculateTotalTime(sortedIssues)
  };

  // Handle issue selection
  const handleIssueClick = (id: number | null) => {
    if (id !== null) {
      const element = document.getElementById(`implementation-${id}`);
      if (element) {
        setActiveTab('checklist');
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Handle viewing implementation for a specific issue
  const handleViewImplementation = (id: number) => {
    setActiveIssueId(id);
    setCurrentView('single-issue');
  };

  // Return to the overview
  const handleBackToOverview = () => {
    setCurrentView('overview');
    setActiveIssueId(null);
  };

  // Auto-scroll to selected issue if provided
  useEffect(() => {
    if (selectedIssue) {
      setActiveIssueId(selectedIssue);
      setCurrentView('single-issue');
    }
  }, [selectedIssue]);

  // Handle PDF export
  const handleExportPdf = () => {
    try {
      exportResultsAsPdf('implementation-guide-content', 'implementation-guide.pdf');
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "Export failed",
        description: "There was an error generating the PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Find the active issue
  const activeIssue = sortedIssues.find(issue => issue.id === activeIssueId);

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-auto">
      <div className="container mx-auto py-8 px-4 md:px-6">
        {currentView === 'overview' ? (
          <>
            <ImplementationGuideHeader 
              onClose={onClose} 
              onExportPdf={handleExportPdf} 
            />

            <div className="mb-4">
              <p className="text-sm text-neutral-600">
                This guide provides a prioritized implementation plan for all design issues. 
                Follow the recommended sequence to achieve maximum impact with minimum effort.
              </p>
            </div>

            <ImplementationTabs activeTab={activeTab} setActiveTab={setActiveTab} />

            <ImplementationContent 
              activeTab={activeTab}
              issues={sortedIssues}
              completedItems={completedItems}
              timeInvestmentSummary={timeInvestmentSummary}
              onIssueClick={handleIssueClick}
              onViewImplementation={handleViewImplementation}
              toggleCompleted={toggleCompleted}
              selectedIssue={selectedIssue || null}
            />
          </>
        ) : (
          activeIssue && (
            <SingleIssueImplementation
              issue={activeIssue}
              onBack={handleBackToOverview}
              isCompleted={completedItems.includes(activeIssue.id || 0)}
              onToggleComplete={toggleCompleted}
            />
          )
        )}
      </div>
    </div>
  );
};
