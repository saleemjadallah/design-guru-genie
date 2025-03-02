
import React from "react";
import { Button } from "@/components/ui/button";
import { Check, FileCode, Clock } from "lucide-react";

interface FeedbackIssue {
  id?: number;
  title: string;
  description: string;
  priority?: "low" | "medium" | "high";
  type: "positive" | "improvement";
  principle?: string;
  location?: { x: number; y: number };
  technical_details?: string;
  impact?: "low" | "medium" | "high";
  effort?: "low" | "medium" | "high";
  time_estimate?: string;
}

interface FeedbackIssueCardProps {
  issue: FeedbackIssue;
  isSelected: boolean;
  onIssueSelect: (id: number | null) => void;
  onPriorityClick?: (id: number, priority: "low" | "medium" | "high") => void;
  onImplementationClick?: (id: number) => void;
}

export const FeedbackIssueCard = ({
  issue,
  isSelected,
  onIssueSelect,
  onPriorityClick,
  onImplementationClick
}: FeedbackIssueCardProps) => {
  const getPriorityClasses = (priority?: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-orange-100 text-orange-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-neutral-100 text-neutral-800";
    }
  };

  const getImpactEffortBadge = () => {
    if (!issue.impact && !issue.effort) return null;
    
    const impact = issue.impact || "medium";
    const effort = issue.effort || "medium";
    
    return (
      <div className="flex items-center text-xs text-neutral-600 mt-1 mb-2">
        {issue.impact && (
          <span className={`mr-2 px-1.5 py-0.5 rounded ${
            impact === "high" ? "bg-red-50 text-red-700" : 
            impact === "medium" ? "bg-yellow-50 text-yellow-700" : 
            "bg-blue-50 text-blue-700"
          }`}>
            {impact} impact
          </span>
        )}
        {issue.effort && (
          <span className={`px-1.5 py-0.5 rounded ${
            effort === "high" ? "bg-red-50 text-red-700" : 
            effort === "medium" ? "bg-yellow-50 text-yellow-700" : 
            "bg-blue-50 text-blue-700"
          }`}>
            {effort} effort
          </span>
        )}
        {issue.time_estimate && (
          <span className="ml-2 flex items-center text-neutral-500">
            <Clock className="w-3 h-3 mr-1" />
            {issue.time_estimate}
          </span>
        )}
      </div>
    );
  };

  const handleImplementationClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (issue.id !== undefined && onImplementationClick) {
      onImplementationClick(issue.id);
    }
  };

  return (
    <div
      className={`border rounded-lg p-4 transition-all ${
        isSelected
          ? "border-accent ring-1 ring-accent"
          : "border-neutral-200 hover:border-neutral-300"
      }`}
      onClick={() => onIssueSelect(issue.id ?? null)}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center">
          {issue.id !== undefined && issue.location && (
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white mr-2 ${
              issue.priority === "high" ? "bg-red-500" : 
              issue.priority === "medium" ? "bg-amber-500" : "bg-blue-500"
            }`}>
              {issue.id}
            </div>
          )}
          <h3 className="font-medium text-neutral-900">{issue.title}</h3>
        </div>
        <div
          className={`text-xs px-2 py-0.5 rounded-full ${getPriorityClasses(
            issue.priority
          )}`}
        >
          {issue.priority || "unset"} priority
        </div>
      </div>

      {getImpactEffortBadge()}

      <p className="text-neutral-600 text-sm mb-3">{issue.description}</p>

      {issue.principle && (
        <div className="text-xs text-neutral-500 mb-3">
          <span className="font-medium">Principle: </span>
          {issue.principle}
        </div>
      )}

      <div className="flex justify-between items-center mt-2">
        {onPriorityClick && (
          <div className="flex flex-wrap gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (issue.id !== undefined) {
                  onPriorityClick(issue.id, "low");
                }
              }}
              className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                issue.priority === "low"
                  ? "bg-green-100 text-green-800 border-green-200"
                  : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              {issue.priority === "low" && (
                <Check className="inline w-3 h-3 mr-1" />
              )}
              Low
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (issue.id !== undefined) {
                  onPriorityClick(issue.id, "medium");
                }
              }}
              className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                issue.priority === "medium"
                  ? "bg-orange-100 text-orange-800 border-orange-200"
                  : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              {issue.priority === "medium" && (
                <Check className="inline w-3 h-3 mr-1" />
              )}
              Medium
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (issue.id !== undefined) {
                  onPriorityClick(issue.id, "high");
                }
              }}
              className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                issue.priority === "high"
                  ? "bg-red-100 text-red-800 border-red-200"
                  : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              {issue.priority === "high" && (
                <Check className="inline w-3 h-3 mr-1" />
              )}
              High
            </button>
          </div>
        )}
        
        <Button
          variant="outline"
          size="sm"
          className="ml-auto text-xs bg-primary/10 hover:bg-primary/20 text-primary hover:text-primary"
          onClick={handleImplementationClick}
        >
          <FileCode className="w-3.5 h-3.5 mr-1" />
          Implementation
        </Button>
      </div>
    </div>
  );
};
