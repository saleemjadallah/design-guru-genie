
import React from "react";
import { ImplementationFeedback } from "./types";
import { IssueCard } from "./IssueCard";

interface PrioritySectionProps {
  title: string;
  color: "red" | "orange" | "green";
  issues: ImplementationFeedback[];
  completedItems: number[];
  toggleCompleted: (id: number) => void;
  selectedIssue: number | null;
  onViewImplementation?: (id: number) => void;
}

export const PrioritySection: React.FC<PrioritySectionProps> = ({
  title,
  color,
  issues,
  completedItems,
  toggleCompleted,
  selectedIssue,
  onViewImplementation
}) => {
  if (issues.length === 0) return null;
  
  return (
    <div className="mb-8">
      <h4 className={`font-medium text-${color}-800 mb-3 flex items-center`}>
        <span className={`inline-block w-2 h-2 bg-${color}-500 rounded-full mr-2`}></span>
        {title}
      </h4>
      
      {issues.map(issue => {
        // Convert issue.id to number to ensure type consistency
        const issueId = typeof issue.id === 'string' ? parseInt(issue.id) : (issue.id || 0);
        // Check if the issue is completed
        const isCompleted = issueId !== 0 && completedItems.includes(issueId);
        
        return (
          <IssueCard
            key={issueId}
            issue={issue}
            isCompleted={isCompleted}
            toggleCompleted={toggleCompleted}
            selectedIssue={selectedIssue}
            onViewImplementation={onViewImplementation}
          />
        );
      })}
    </div>
  );
};
