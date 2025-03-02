
import React from "react";
import { ImplementationFeedback } from "./types";
import { IssueHeader } from "./IssueHeader";
import { IssueMetadata } from "./IssueMetadata";
import { IssueDetails } from "./IssueDetails";
import { IssueTools } from "./IssueTools";

interface SingleIssueImplementationProps {
  issue: ImplementationFeedback;
  onBack: () => void;
  isCompleted: boolean;
  onToggleComplete: (id: number) => void;
}

export const SingleIssueImplementation: React.FC<SingleIssueImplementationProps> = ({
  issue,
  onBack,
  isCompleted,
  onToggleComplete
}) => {
  return (
    <div className="max-w-3xl mx-auto">
      <IssueHeader 
        issue={issue}
        onBack={onBack}
        isCompleted={isCompleted}
        onToggleComplete={onToggleComplete}
      />

      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-sm mb-6">
        <IssueMetadata issue={issue} />
        <IssueDetails issue={issue} />
        <IssueTools issue={issue} />
      </div>
    </div>
  );
};
