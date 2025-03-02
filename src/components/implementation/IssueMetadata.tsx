
import React from "react";
import { Clock, FileCode, Wrench } from "lucide-react";
import { ImplementationFeedback } from "./types";

interface IssueMetadataProps {
  issue: ImplementationFeedback;
}

export const IssueMetadata: React.FC<IssueMetadataProps> = ({ issue }) => {
  return (
    <div className="flex items-center gap-3 mb-4 text-sm text-neutral-600">
      <div className="flex items-center">
        <Clock className="w-4 h-4 mr-1" />
        <span>{issue.time_estimate || "30-60 minutes"}</span>
      </div>
      <div className="flex items-center">
        <FileCode className="w-4 h-4 mr-1" />
        <span>
          {issue.impact === "high" ? "High impact" : 
           issue.impact === "medium" ? "Medium impact" : "Low impact"}
        </span>
      </div>
      <div className="flex items-center">
        <Wrench className="w-4 h-4 mr-1" />
        <span>
          {issue.effort === "high" ? "High effort" : 
           issue.effort === "medium" ? "Medium effort" : "Low effort"}
        </span>
      </div>
    </div>
  );
};
