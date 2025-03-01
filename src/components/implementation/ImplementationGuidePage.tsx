
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import { exportResultsAsPdf } from "@/utils/pdf-export";
import { toast } from "@/hooks/use-toast";
import { ImplementationFeedback, TimeInvestmentSummary } from "./types";
import { ImpactEffortMatrix } from "./ImpactEffortMatrix";
import { ImplementationChecklist } from "./ImplementationChecklist";
import { TimeInvestmentSummary as TimeInvestmentSummaryComponent } from "./TimeInvestmentSummary";
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

  // Auto-scroll to selected issue if provided
  useEffect(() => {
    if (selectedIssue) {
      const element = document.getElementById(`implementation-${selectedIssue}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setActiveTab('checklist'); // Switch to checklist tab when selecting an issue
      }
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

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-auto">
      <div className="container mx-auto py-8 px-4 md:px-6">
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
            />
          )}

          {activeTab === 'checklist' && (
            <ImplementationChecklist 
              issues={sortedIssues}
              completedItems={completedItems}
              toggleCompleted={toggleCompleted}
              selectedIssue={selectedIssue || null}
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
      </div>
    </div>
  );
};
