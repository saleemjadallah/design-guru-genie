
import React from "react";
import { ImplementationFeedback } from "./types";
import { PrioritySection } from "./PrioritySection";
import { ChecklistHeader } from "./ChecklistHeader";

interface ImplementationChecklistProps {
  issues: ImplementationFeedback[];
  completedItems: number[];
  toggleCompleted: (id: number) => void;
  selectedIssue: number | null;
  onViewImplementation?: (id: number) => void;
}

export const ImplementationChecklist = ({
  issues,
  completedItems,
  toggleCompleted,
  selectedIssue,
  onViewImplementation
}: ImplementationChecklistProps) => {
  const priorityGroups = {
    high: issues.filter(issue => issue.priority === "high"),
    medium: issues.filter(issue => issue.priority === "medium"),
    low: issues.filter(issue => issue.priority === "low" || !issue.priority)
  };

  return (
    <div className="implementation-checklist mb-10">
      <ChecklistHeader />

      {/* High Priority Issues */}
      <PrioritySection
        title="High Priority Issues"
        color="red"
        issues={priorityGroups.high}
        completedItems={completedItems}
        toggleCompleted={toggleCompleted}
        selectedIssue={selectedIssue}
        onViewImplementation={onViewImplementation}
      />

      {/* Medium Priority Issues */}
      <PrioritySection
        title="Medium Priority Issues"
        color="orange"
        issues={priorityGroups.medium}
        completedItems={completedItems}
        toggleCompleted={toggleCompleted}
        selectedIssue={selectedIssue}
        onViewImplementation={onViewImplementation}
      />

      {/* Low Priority Issues */}
      <PrioritySection
        title="Low Priority Issues"
        color="green"
        issues={priorityGroups.low}
        completedItems={completedItems}
        toggleCompleted={toggleCompleted}
        selectedIssue={selectedIssue}
        onViewImplementation={onViewImplementation}
      />

      {Object.values(priorityGroups).every(group => group.length === 0) && (
        <div className="text-center py-10 bg-neutral-50 rounded-lg border border-neutral-200">
          <p className="text-neutral-600">No implementation tasks found.</p>
        </div>
      )}
    </div>
  );
};
