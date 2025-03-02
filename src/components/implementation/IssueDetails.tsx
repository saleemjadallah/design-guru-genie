
import React from "react";
import { ImplementationFeedback } from "./types";

interface IssueDetailsProps {
  issue: ImplementationFeedback;
}

export const IssueDetails: React.FC<IssueDetailsProps> = ({ issue }) => {
  return (
    <>
      <div className="mb-6">
        <h4 className="font-medium mb-2">Description</h4>
        <p className="text-neutral-700">{issue.description}</p>
      </div>

      {issue.principle && (
        <div className="mb-6">
          <h4 className="font-medium mb-2">Design Principle</h4>
          <p className="text-neutral-700">{issue.principle}</p>
        </div>
      )}

      <div className="mb-6">
        <h4 className="font-medium mb-2">Implementation Steps</h4>
        <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-100">
          {issue.technical_details ? (
            <div className="prose prose-sm max-w-none">
              {issue.technical_details.split('\n').map((line, i) => (
                <p key={i} className={i > 0 ? "mt-3" : ""}>
                  {line}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-neutral-600">
              1. Analyze the issue carefully<br/>
              2. Make the necessary code changes<br/>
              3. Test thoroughly to ensure your changes work as expected<br/>
              4. Mark as complete when finished
            </p>
          )}
        </div>
      </div>
    </>
  );
};
