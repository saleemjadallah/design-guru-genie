
import React from "react";
import { DesignIssue } from "./DesignIssue";
import { AlertCircle, AlertTriangle, Check } from "lucide-react";

interface Issue {
  title: string;
  description: string;
}

interface DesignIssues {
  high: Issue[];
  medium: Issue[];
  low: Issue[];
}

interface DesignIssuesSectionProps {
  issues: DesignIssues;
}

export const DesignIssuesSection = ({ 
  issues 
}: DesignIssuesSectionProps) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Design Issues</h2>
      
      {/* High Priority Issues */}
      <div className="mb-6">
        <h3 className="font-medium text-red-800 flex items-center mb-3">
          <AlertCircle className="w-4 h-4 mr-2" />
          High Priority Issues
        </h3>
        <div className="space-y-3">
          {issues.high.map((issue, index) => (
            <DesignIssue 
              key={index}
              title={issue.title}
              description={issue.description}
              priority="high"
            />
          ))}
        </div>
      </div>
      
      {/* Medium Priority Issues */}
      <div className="mb-6">
        <h3 className="font-medium text-orange-800 flex items-center mb-3">
          <AlertTriangle className="w-4 h-4 mr-2" />
          Medium Priority Issues
        </h3>
        <div className="space-y-3">
          {issues.medium.map((issue, index) => (
            <DesignIssue 
              key={index}
              title={issue.title}
              description={issue.description}
              priority="medium"
            />
          ))}
        </div>
      </div>
      
      {/* Low Priority Issues */}
      <div>
        <h3 className="font-medium text-green-800 flex items-center mb-3">
          <Check className="w-4 h-4 mr-2" />
          Low Priority Issues
        </h3>
        <div className="space-y-3">
          {issues.low.map((issue, index) => (
            <DesignIssue 
              key={index}
              title={issue.title}
              description={issue.description}
              priority="low"
            />
          ))}
        </div>
      </div>
    </div>
  );
};
