
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import { exportResultsAsPdf } from "@/utils/pdf-export";
import { toast } from "@/hooks/use-toast";
import { ImplementationFeedback, TimeInvestmentSummary } from "./types";
import { ImpactEffortMatrix } from "./ImpactEffortMatrix";
import { ImplementationChecklist } from "./ImplementationChecklist";
import { TimeInvestmentSummaryComponent } from "./TimeInvestmentSummary";
import { SingleIssueImplementation } from "./SingleIssueImplementation";
import { calculateTotalTime, processIssues, sortIssuesByPriority } from "./utils";

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
  const [activeTab, setActiveTab] = useState<'matrix' | 'checklist' | 'summary'>('matrix');
  const [currentView, setCurrentView] = useState<'overview' | 'single-issue'>('overview');
  const [activeIssueId, setActiveIssueId] = useState<number | null>(null);
  
  // Process and sort issues
  const processedIssues = processIssues(issues, completedItems);
  const sortedIssues = sortIssuesByPriority(processedIssues);

  // Toggle completion status
  const toggleCompleted = (id: number) => {
    if (completedItems.includes(id)) {
      setCompletedItems(completedItems.filter(itemId => itemId !== id));
    } else {
      setCompletedItems([...completedItems, id]);
    }
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
      handleViewImplementation(selectedIssue);
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
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mr-2"
                  onClick={onClose}
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to Analysis Review
                </Button>
                <h2 className="text-xl font-bold">Implementation Guide</h2>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExportPdf}
              >
                <Download className="w-4 h-4 mr-1" />
                Export PDF
              </Button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-neutral-600">
                This guide provides a prioritized implementation plan for all design issues. 
                Follow the recommended sequence to achieve maximum impact with minimum effort.
              </p>
            </div>

            <div className="flex border-b border-neutral-200 mb-6 overflow-x-auto">
              <Button 
                variant="ghost" 
                className={`pb-2 rounded-none ${activeTab === 'matrix' ? 'border-b-2 border-primary' : ''}`}
                onClick={() => setActiveTab('matrix')}
              >
                Impact/Effort Matrix
              </Button>
              <Button 
                variant="ghost" 
                className={`pb-2 rounded-none ${activeTab === 'checklist' ? 'border-b-2 border-primary' : ''}`}
                onClick={() => setActiveTab('checklist')}
              >
                Implementation Checklist
              </Button>
              <Button 
                variant="ghost" 
                className={`pb-2 rounded-none ${activeTab === 'summary' ? 'border-b-2 border-primary' : ''}`}
                onClick={() => setActiveTab('summary')}
              >
                Time Investment
              </Button>
            </div>

            <div id="implementation-guide-content" className="pb-16 max-w-6xl mx-auto">
              {activeTab === 'matrix' && (
                <ImpactEffortMatrix 
                  issues={sortedIssues} 
                  completedItems={completedItems}
                  onIssueClick={handleIssueClick}
                  onViewImplementation={handleViewImplementation}
                />
              )}

              {activeTab === 'checklist' && (
                <ImplementationChecklist 
                  issues={sortedIssues}
                  completedItems={completedItems}
                  toggleCompleted={toggleCompleted}
                  selectedIssue={selectedIssue || null}
                  onViewImplementation={handleViewImplementation}
                />
              )}

              {activeTab === 'summary' && (
                <TimeInvestmentSummaryComponent 
                  issues={sortedIssues}
                  completedItems={completedItems}
                  timeInvestmentSummary={timeInvestmentSummary}
                />
              )}
            </div>
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
