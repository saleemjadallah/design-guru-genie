
import React from "react";
import { ImpactEffortMatrix } from "./ImpactEffortMatrix";
import { ImplementationChecklist } from "./ImplementationChecklist";
import { TimeInvestmentSummary } from "./TimeInvestmentSummary";
import { ImplementationTab } from "./ImplementationTabs";
import { ImplementationFeedback, TimeInvestmentSummary as TimeInvestmentSummaryType } from "./types";

interface ImplementationContentProps {
  activeTab: ImplementationTab;
  issues: ImplementationFeedback[];
  completedItems: number[];
  timeInvestmentSummary: TimeInvestmentSummaryType;
  onIssueClick: (id: number | null) => void;
  onViewImplementation: (id: number) => void;
  toggleCompleted: (id: number) => void;
  selectedIssue: number | null;
}

export const ImplementationContent: React.FC<ImplementationContentProps> = ({
  activeTab,
  issues,
  completedItems,
  timeInvestmentSummary,
  onIssueClick,
  onViewImplementation,
  toggleCompleted,
  selectedIssue
}) => {
  return (
    <div id="implementation-guide-content" className="pb-16 max-w-6xl mx-auto">
      {activeTab === 'matrix' && (
        <ImpactEffortMatrix 
          issues={issues} 
          completedItems={completedItems}
          onIssueClick={onIssueClick}
          onViewImplementation={onViewImplementation}
        />
      )}

      {activeTab === 'checklist' && (
        <ImplementationChecklist 
          issues={issues}
          completedItems={completedItems}
          toggleCompleted={toggleCompleted}
          selectedIssue={selectedIssue}
          onViewImplementation={onViewImplementation}
        />
      )}

      {activeTab === 'summary' && (
        <TimeInvestmentSummary 
          issues={issues}
          completedItems={completedItems}
          timeInvestmentSummary={timeInvestmentSummary}
        />
      )}
    </div>
  );
};
