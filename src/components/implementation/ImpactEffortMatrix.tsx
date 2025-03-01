
import React from "react";
import { ImplementationFeedback } from "./types";

interface ImpactEffortMatrixProps {
  issues: ImplementationFeedback[];
  completedItems: number[];
  onIssueClick: (id: number | null) => void;
}

export const ImpactEffortMatrix = ({ 
  issues, 
  completedItems,
  onIssueClick
}: ImpactEffortMatrixProps) => {
  return (
    <div className="implementation-matrix mb-8">
      <h3 className="text-lg font-medium mb-3">Impact vs. Effort Matrix</h3>
      <p className="text-sm text-neutral-600 mb-4">
        This matrix helps prioritize changes based on their impact and required effort.
        Focus first on Quick Wins (high impact, low effort) for maximum effectiveness.
      </p>
      
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="quadrant bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="text-green-800 font-medium text-sm mb-1">Quick Wins</h4>
          <p className="text-xs text-green-700 mb-2">Do these first</p>
          <div className="flex flex-wrap gap-2">
            {issues
              .filter(issue => issue.impact === "high" && issue.effort === "low")
              .map(issue => (
                <div 
                  key={issue.id}
                  className={`w-8 h-8 rounded-full flex items-center justify-center bg-green-600 text-white text-xs font-medium cursor-pointer ${completedItems.includes(issue.id || 0) ? 'opacity-50' : ''}`}
                  onClick={() => onIssueClick(issue.id)}
                >
                  {issue.id}
                </div>
              ))}
          </div>
        </div>
        
        <div className="quadrant bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="text-orange-800 font-medium text-sm mb-1">Major Projects</h4>
          <p className="text-xs text-orange-700 mb-2">Plan and prioritize</p>
          <div className="flex flex-wrap gap-2">
            {issues
              .filter(issue => issue.impact === "high" && issue.effort === "high")
              .map(issue => (
                <div 
                  key={issue.id}
                  className={`w-8 h-8 rounded-full flex items-center justify-center bg-orange-600 text-white text-xs font-medium cursor-pointer ${completedItems.includes(issue.id || 0) ? 'opacity-50' : ''}`}
                  onClick={() => onIssueClick(issue.id)}
                >
                  {issue.id}
                </div>
              ))}
          </div>
        </div>
        
        <div className="quadrant bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-blue-800 font-medium text-sm mb-1">Fill-Ins</h4>
          <p className="text-xs text-blue-700 mb-2">Do when time permits</p>
          <div className="flex flex-wrap gap-2">
            {issues
              .filter(issue => issue.impact === "low" && issue.effort === "low")
              .map(issue => (
                <div 
                  key={issue.id}
                  className={`w-8 h-8 rounded-full flex items-center justify-center bg-blue-600 text-white text-xs font-medium cursor-pointer ${completedItems.includes(issue.id || 0) ? 'opacity-50' : ''}`}
                  onClick={() => onIssueClick(issue.id)}
                >
                  {issue.id}
                </div>
              ))}
          </div>
        </div>
        
        <div className="quadrant bg-neutral-50 border border-neutral-200 rounded-lg p-4">
          <h4 className="text-neutral-800 font-medium text-sm mb-1">Think Twice</h4>
          <p className="text-xs text-neutral-700 mb-2">Consider if worth effort</p>
          <div className="flex flex-wrap gap-2">
            {issues
              .filter(issue => issue.impact === "low" && issue.effort === "high")
              .map(issue => (
                <div 
                  key={issue.id}
                  className={`w-8 h-8 rounded-full flex items-center justify-center bg-neutral-600 text-white text-xs font-medium cursor-pointer ${completedItems.includes(issue.id || 0) ? 'opacity-50' : ''}`}
                  onClick={() => onIssueClick(issue.id)}
                >
                  {issue.id}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
