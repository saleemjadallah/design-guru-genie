
import React from "react";
import { ImplementationFeedback } from "./types";

interface IssueToolsProps {
  issue: ImplementationFeedback;
}

export const IssueTools: React.FC<IssueToolsProps> = ({ issue }) => {
  const tools = issue.tools_needed || ["Code editor"];
  
  return (
    <div className="mb-4">
      <h4 className="font-medium mb-2">Tools Needed</h4>
      <div className="flex flex-wrap gap-2">
        {tools.map((tool, index) => (
          <span key={index} className="px-2 py-1 bg-neutral-100 text-neutral-700 rounded-md text-xs">
            {tool}
          </span>
        ))}
      </div>
    </div>
  );
};
