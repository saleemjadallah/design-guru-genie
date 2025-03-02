
import React from "react";
import { Button } from "@/components/ui/button";
import { Check, Clock, FileCode, ArrowRight, Wrench } from "lucide-react";
import { ImplementationFeedback } from "./types";

interface IssueCardProps {
  issue: ImplementationFeedback;
  isCompleted: boolean;
  toggleCompleted: (id: number) => void;
  selectedIssue: number | null;
  onViewImplementation?: (id: number) => void;
}

export const IssueCard: React.FC<IssueCardProps> = ({
  issue,
  isCompleted,
  toggleCompleted,
  selectedIssue,
  onViewImplementation
}) => {
  // Convert issue.id to number to ensure type consistency
  const issueId = typeof issue.id === 'string' ? parseInt(issue.id) : (issue.id || 0);
  
  console.log(`Issue #${issueId}:`, {
    originalId: issue.id,
    convertedId: issueId,
    isCompleted,
    includes: isCompleted
  });
  
  const handleToggleCompleted = (e: React.MouseEvent) => {
    // Make sure the event doesn't propagate if this is inside another clickable element
    e.stopPropagation();
    
    console.log("Button clicked for issue:", issueId);
    
    // Only toggle if we have a valid ID
    if (issueId !== 0) {
      toggleCompleted(issueId);
      console.log("Toggling completion from checklist for issue:", issueId);
    } else {
      console.warn("Cannot toggle completion for issue with invalid ID:", issue.id);
    }
  };
  
  const handleViewImplementation = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewImplementation && issueId !== 0) {
      console.log("Viewing implementation from checklist for issue:", issueId);
      onViewImplementation(issueId);
    }
  };
  
  return (
    <div 
      key={issueId} 
      id={`implementation-${issueId}`}
      className={`border rounded-lg p-5 mb-4 transition ${isCompleted ? 'bg-neutral-50' : 'bg-white'} ${
        selectedIssue === issueId ? 'ring-2 ring-primary border-primary' : 'border-neutral-200'
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center mb-1">
            <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded mr-2">
              Issue #{issueId}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              issue.priority === "high" ? "bg-red-100 text-red-800" :
              issue.priority === "medium" ? "bg-orange-100 text-orange-800" :
              "bg-green-100 text-green-800"
            }`}>
              {issue.priority || "low"} priority
            </span>
          </div>
          <h3 className={`font-medium ${isCompleted ? 'text-neutral-500 line-through' : 'text-neutral-900'}`}>
            {issue.title}
          </h3>
        </div>
        <div className="flex items-center">
          <Button
            variant={isCompleted ? "outline" : "default"}
            size="sm"
            className={`mr-2 ${isCompleted ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800" : ""}`}
            onClick={handleToggleCompleted}
            type="button"
          >
            {isCompleted ? (
              <>
                <Check className="w-4 h-4 mr-1" />
                Done
              </>
            ) : (
              "Mark Done"
            )}
          </Button>
          {onViewImplementation && issueId !== 0 && (
            <Button
              variant="outline"
              size="sm"
              className="bg-primary/10 text-primary hover:bg-primary/20"
              onClick={handleViewImplementation}
              type="button"
            >
              <FileCode className="w-4 h-4 mr-1" />
              View Steps
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center text-sm text-neutral-600 mb-3">
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-1" />
          {issue.time_estimate || "30-60 minutes"}
        </div>
        <div className="flex items-center">
          <Wrench className="w-4 h-4 mr-1" />
          {issue.tools_needed?.join(", ") || "Code editor"}
        </div>
        <div className={`px-2 py-0.5 rounded-md text-xs ${
          issue.skill_level === "beginner" ? "bg-green-50 text-green-700" :
          issue.skill_level === "advanced" ? "bg-orange-50 text-orange-700" :
          "bg-blue-50 text-blue-700"
        }`}>
          {issue.skill_level || "intermediate"} level
        </div>
      </div>

      <p className={`text-sm ${isCompleted ? 'text-neutral-500' : 'text-neutral-700'} mb-3`}>
        {issue.description}
      </p>

      <div className="flex justify-end">
        {onViewImplementation && issueId !== 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary hover:bg-primary/10"
            onClick={handleViewImplementation}
            type="button"
          >
            <span>Detailed Implementation</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
};
