
import React from "react";
import { CheckCircle2, Clock } from "lucide-react";
import { ImplementationFeedback } from "./types";

interface ImplementationChecklistProps {
  issues: ImplementationFeedback[];
  completedItems: number[];
  toggleCompleted: (id: number) => void;
  selectedIssue: number | null;
}

export const ImplementationChecklist = ({
  issues,
  completedItems,
  toggleCompleted,
  selectedIssue
}: ImplementationChecklistProps) => {
  return (
    <div className="space-y-8">
      <h3 className="text-lg font-medium mb-3">Implementation Checklist</h3>
      <p className="text-sm text-neutral-600 mb-4">
        Follow this recommended sequence for implementing changes. Items are ordered by priority and impact-to-effort ratio.
      </p>
      
      {issues.map((issue, index) => (
        <div 
          key={issue.id} 
          id={`implementation-${issue.id}`}
          className={`border rounded-lg p-5 transition-all ${
            completedItems.includes(issue.id || 0) ? 'border-green-200 bg-green-50' : 'border-neutral-200'
          } ${selectedIssue === issue.id ? 'ring-2 ring-primary' : ''}`}
        >
          <div className="flex items-start">
            <button 
              className={`mt-1 mr-3 rounded-full flex-shrink-0 ${
                completedItems.includes(issue.id || 0) ? 'text-green-500' : 'text-neutral-300 hover:text-neutral-400'
              }`}
              onClick={() => toggleCompleted(issue.id || 0)}
            >
              <CheckCircle2 className={`w-5 h-5 ${completedItems.includes(issue.id || 0) ? 'fill-green-500' : ''}`} />
            </button>
            
            <div className="flex-grow">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-medium text-lg">
                  {index + 1}. {issue.title}
                </h3>
                <div
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    issue.priority === "high"
                      ? "bg-red-100 text-red-800"
                      : issue.priority === "medium"
                      ? "bg-orange-100 text-orange-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {issue.priority || "low"} priority
                </div>
              </div>
              
              <p className="text-neutral-700 mb-4">{issue.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-neutral-50 p-3 rounded-md">
                  <span className="text-sm font-medium block mb-1">Impact: </span>
                  <span className={`text-sm ${
                    issue.impact === "high"
                      ? "text-red-600"
                      : issue.impact === "medium"
                      ? "text-orange-600"
                      : "text-green-600"
                  }`}>
                    {issue.impact?.charAt(0).toUpperCase() + issue.impact?.slice(1) || "Medium"}
                  </span>
                </div>
                
                <div className="bg-neutral-50 p-3 rounded-md">
                  <span className="text-sm font-medium block mb-1">Effort: </span>
                  <span className="text-sm">
                    {issue.effort?.charAt(0).toUpperCase() + issue.effort?.slice(1) || "Medium"}
                  </span>
                </div>
                
                <div className="bg-neutral-50 p-3 rounded-md">
                  <span className="text-sm font-medium block mb-1">Time Estimate: </span>
                  <span className="text-sm flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {issue.time_estimate}
                  </span>
                </div>
              </div>
              
              {issue.principle && (
                <div className="bg-neutral-50 p-3 rounded-md mb-4">
                  <span className="text-sm font-medium">Design Principle: </span>
                  <span className="text-sm">{issue.principle}</span>
                </div>
              )}
              
              <div className="bg-neutral-50 p-3 rounded-md mb-4">
                <h4 className="text-sm font-medium mb-2">Implementation Details:</h4>
                <div className="text-sm whitespace-pre-wrap">
                  {issue.technical_details || "No specific implementation details provided."}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-neutral-50 p-3 rounded-md">
                  <h4 className="text-sm font-medium mb-2">Tools Needed:</h4>
                  <ul className="text-sm list-disc pl-5 space-y-1">
                    {issue.tools_needed?.map((tool, i) => (
                      <li key={i}>{tool}</li>
                    )) || <li>Code editor</li>}
                  </ul>
                </div>
                
                <div className="bg-neutral-50 p-3 rounded-md">
                  <h4 className="text-sm font-medium mb-2">Skill Level Required:</h4>
                  <span className={`text-sm px-2 py-1 rounded ${
                    issue.skill_level === "beginner"
                      ? "bg-green-100 text-green-800"
                      : issue.skill_level === "intermediate"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-purple-100 text-purple-800"
                  }`}>
                    {issue.skill_level?.charAt(0).toUpperCase() + issue.skill_level?.slice(1) || "Intermediate"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
