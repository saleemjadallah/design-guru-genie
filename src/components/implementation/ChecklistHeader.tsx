
import React from "react";

export const ChecklistHeader: React.FC = () => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-2">Implementation Checklist</h3>
      <p className="text-sm text-neutral-600">
        Follow this checklist to address all design issues in order of priority.
        Mark items as completed as you implement them.
      </p>
    </div>
  );
};
