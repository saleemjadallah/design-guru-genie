
import React from "react";
import { Button } from "@/components/ui/button";
import { Check, Clock, FileCode, ArrowRight, Wrench } from "lucide-react";
import { ImplementationFeedback } from "./types";

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

  const renderIssue = (issue: ImplementationFeedback) => {
    const isCompleted = completedItems.includes(issue.id || 0);
    const isSelected = selectedIssue === issue.id;
    
    const handleViewImplementationClick = () => {
      if (onViewImplementation && issue.id !== undefined) {
        onViewImplementation(issue.id);
      }
    };

    return (
      <div 
        key={issue.id} 
        id={`implementation-${issue.id}`}
        className={`border rounded-lg p-5 mb-4 transition ${isCompleted ? 'bg-neutral-50' : 'bg-white'} ${
          isSelected ? 'ring-2 ring-primary border-primary' : 'border-neutral-200'
        }`}
      >
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="flex items-center mb-1">
              <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded mr-2">
                Issue #{issue.id}
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
              onClick={() => toggleCompleted(issue.id || 0)}
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
            {onViewImplementation && (
              <Button
                variant="outline"
                size="sm"
                className="bg-primary/10 text-primary hover:bg-primary/20"
                onClick={handleViewImplementationClick}
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
          {onViewImplementation && (
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:text-primary hover:bg-primary/10"
              onClick={handleViewImplementationClick}
            >
              <span>Detailed Implementation</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="implementation-checklist mb-10">
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Implementation Checklist</h3>
        <p className="text-sm text-neutral-600">
          Follow this checklist to address all design issues in order of priority.
          Mark items as completed as you implement them.
        </p>
      </div>

      {/* High Priority Issues */}
      {priorityGroups.high.length > 0 && (
        <div className="mb-8">
          <h4 className="font-medium text-red-800 mb-3 flex items-center">
            <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2"></span>
            High Priority Issues
          </h4>
          {priorityGroups.high.map(renderIssue)}
        </div>
      )}

      {/* Medium Priority Issues */}
      {priorityGroups.medium.length > 0 && (
        <div className="mb-8">
          <h4 className="font-medium text-orange-800 mb-3 flex items-center">
            <span className="inline-block w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
            Medium Priority Issues
          </h4>
          {priorityGroups.medium.map(renderIssue)}
        </div>
      )}

      {/* Low Priority Issues */}
      {priorityGroups.low.length > 0 && (
        <div className="mb-8">
          <h4 className="font-medium text-green-800 mb-3 flex items-center">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Low Priority Issues
          </h4>
          {priorityGroups.low.map(renderIssue)}
        </div>
      )}

      {Object.values(priorityGroups).every(group => group.length === 0) && (
        <div className="text-center py-10 bg-neutral-50 rounded-lg border border-neutral-200">
          <p className="text-neutral-600">No implementation tasks found.</p>
        </div>
      )}
    </div>
  );
};
