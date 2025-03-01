
import React from "react";
import { FeedbackIssueCard } from "./FeedbackIssueCard";
import { Button } from "@/components/ui/button";
import { ListChecks } from "lucide-react";

interface Feedback {
  id?: number;
  title: string;
  description: string;
  priority?: "low" | "medium" | "high";
  type: "positive" | "improvement";
  principle?: string;
  location?: { x: number; y: number };
  technical_details?: string;
}

interface FeedbackIssueListProps {
  issues: Feedback[];
  selectedIssue: number | null;
  onIssueSelect: (id: number | null) => void;
  onPriorityClick?: (id: number, priority: "low" | "medium" | "high") => void;
  onViewAllImplementation?: () => void;
  onViewSingleImplementation?: (id: number) => void;
}

export const FeedbackIssueList = ({
  issues,
  selectedIssue,
  onIssueSelect,
  onPriorityClick,
  onViewAllImplementation,
  onViewSingleImplementation
}: FeedbackIssueListProps) => {
  // Sort issues by priority: high -> medium -> low -> undefined
  const sortedIssues = [...issues].sort((a, b) => {
    const priorityOrder = { high: 1, medium: 2, low: 3, undefined: 4 };
    const aPriority = a.priority || "undefined";
    const bPriority = b.priority || "undefined";
    
    return (priorityOrder[aPriority as keyof typeof priorityOrder]) - 
           (priorityOrder[bPriority as keyof typeof priorityOrder]);
  });

  return (
    <>
      {issues.length > 0 && onViewAllImplementation && (
        <div className="mb-4">
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2"
            onClick={onViewAllImplementation}
          >
            <ListChecks className="w-4 h-4" />
            <span>View All Implementation Steps</span>
          </Button>
        </div>
      )}

      <div className="space-y-4 overflow-y-auto max-h-[600px] pr-2">
        {sortedIssues.length === 0 ? (
          <div className="text-center py-10 text-neutral-500">
            No issues found for this filter criteria.
          </div>
        ) : (
          sortedIssues.map((issue) => (
            <FeedbackIssueCard
              key={issue.id}
              issue={issue}
              isSelected={selectedIssue === issue.id}
              onIssueSelect={onIssueSelect}
              onPriorityClick={onPriorityClick}
              onImplementationClick={onViewSingleImplementation}
            />
          ))
        )}
      </div>
    </>
  );
};
