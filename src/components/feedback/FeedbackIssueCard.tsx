
import React from "react";
import { Button } from "@/components/ui/button";
import { Check, FileCode } from "lucide-react";

interface FeedbackIssue {
  id?: number;
  title: string;
  description: string;
  priority?: "low" | "medium" | "high";
  type: "positive" | "improvement";
  principle?: string;
  location?: { x: number; y: number };
  technical_details?: string;
}

interface FeedbackIssueCardProps {
  issue: FeedbackIssue;
  isSelected: boolean;
  onIssueSelect: (id: number | null) => void;
  onPriorityClick?: (id: number, priority: "low" | "medium" | "high") => void;
}

export const FeedbackIssueCard = ({
  issue,
  isSelected,
  onIssueSelect,
  onPriorityClick
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
        <h3 className="font-medium text-neutral-900">{issue.title}</h3>
        <div
          className={`text-xs px-2 py-0.5 rounded-full ${getPriorityClasses(
            issue.priority
          )}`}
        >
          {issue.priority || "unset"} priority
        </div>
      </div>

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
                onPriorityClick(issue.id || 0, "low");
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
                onPriorityClick(issue.id || 0, "medium");
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
                onPriorityClick(issue.id || 0, "high");
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
          variant="ghost"
          size="sm"
          className="ml-auto text-xs"
          onClick={(e) => {
            e.stopPropagation();
            onIssueSelect(issue.id ?? null);
          }}
        >
          <FileCode className="w-3.5 h-3.5 mr-1" />
          Implementation
        </Button>
      </div>
    </div>
  );
};
