
import React from "react";
import { ImplementationFeedback } from "./types";
import { Star, Zap, Clock, AlertCircle } from "lucide-react";

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
  // Filter issues by their impact/effort combinations
  const quickWins = issues.filter(issue => issue.impact === "high" && issue.effort === "low");
  const majorProjects = issues.filter(issue => issue.impact === "high" && issue.effort === "high");
  const fillIns = issues.filter(issue => issue.impact === "low" && issue.effort === "low");
  const thinkTwice = issues.filter(issue => issue.impact === "low" && issue.effort === "high");
  
  // Determine if each quadrant should show the empty state
  const showEmptyQuickWins = quickWins.length === 0;
  const showEmptyMajorProjects = majorProjects.length === 0;
  const showEmptyFillIns = fillIns.length === 0;
  const showEmptyThinkTwice = thinkTwice.length === 0;

  return (
    <div className="implementation-matrix mb-8">
      <h3 className="text-lg font-medium mb-3">Impact vs. Effort Matrix</h3>
      <p className="text-sm text-neutral-600 mb-4">
        This matrix helps prioritize changes based on their impact and required effort.
        Focus first on Quick Wins (high impact, low effort) for maximum effectiveness.
      </p>
      
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="quadrant bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center mb-1">
            <Zap className="w-4 h-4 text-green-600 mr-1" />
            <h4 className="text-green-800 font-medium text-sm">Quick Wins</h4>
          </div>
          <p className="text-xs text-green-700 mb-2">Do these first</p>
          <div className="flex flex-wrap gap-2">
            {showEmptyQuickWins ? (
              <p className="text-xs text-green-600 italic">No quick wins identified</p>
            ) : (
              quickWins.map(issue => (
                <div 
                  key={issue.id}
                  className={`px-2 py-1 rounded-md border ${
                    completedItems.includes(issue.id || 0) 
                      ? 'bg-green-100 border-green-200 text-green-500 opacity-60' 
                      : 'bg-green-600 border-green-700 text-white'
                  } text-xs font-medium cursor-pointer hover:opacity-90 transition-opacity flex items-center`}
                  onClick={() => onIssueClick(issue.id)}
                  title={issue.title}
                >
                  <Star className="w-3 h-3 mr-1" />
                  {issue.id}
                  {issue.time_estimate && (
                    <span className="ml-1 text-xs flex items-center">
                      <Clock className="w-2.5 h-2.5 mx-0.5" />
                      {issue.time_estimate.replace("min", "")}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="quadrant bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center mb-1">
            <Star className="w-4 h-4 text-orange-600 mr-1" />
            <h4 className="text-orange-800 font-medium text-sm">Major Projects</h4>
          </div>
          <p className="text-xs text-orange-700 mb-2">Plan and prioritize</p>
          <div className="flex flex-wrap gap-2">
            {showEmptyMajorProjects ? (
              <p className="text-xs text-orange-600 italic">No major projects identified</p>
            ) : (
              majorProjects.map(issue => (
                <div 
                  key={issue.id}
                  className={`px-2 py-1 rounded-md border ${
                    completedItems.includes(issue.id || 0) 
                      ? 'bg-orange-100 border-orange-200 text-orange-500 opacity-60' 
                      : 'bg-orange-600 border-orange-700 text-white'
                  } text-xs font-medium cursor-pointer hover:opacity-90 transition-opacity flex items-center`}
                  onClick={() => onIssueClick(issue.id)}
                  title={issue.title}
                >
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {issue.id}
                  {issue.time_estimate && (
                    <span className="ml-1 text-xs flex items-center">
                      <Clock className="w-2.5 h-2.5 mx-0.5" />
                      {issue.time_estimate.replace("min", "")}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="quadrant bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center mb-1">
            <Clock className="w-4 h-4 text-blue-600 mr-1" />
            <h4 className="text-blue-800 font-medium text-sm">Fill-Ins</h4>
          </div>
          <p className="text-xs text-blue-700 mb-2">Do when time permits</p>
          <div className="flex flex-wrap gap-2">
            {showEmptyFillIns ? (
              <p className="text-xs text-blue-600 italic">No fill-ins identified</p>
            ) : (
              fillIns.map(issue => (
                <div 
                  key={issue.id}
                  className={`px-2 py-1 rounded-md border ${
                    completedItems.includes(issue.id || 0) 
                      ? 'bg-blue-100 border-blue-200 text-blue-500 opacity-60' 
                      : 'bg-blue-600 border-blue-700 text-white'
                  } text-xs font-medium cursor-pointer hover:opacity-90 transition-opacity flex items-center`}
                  onClick={() => onIssueClick(issue.id)}
                  title={issue.title}
                >
                  {issue.id}
                  {issue.time_estimate && (
                    <span className="ml-1 text-xs flex items-center">
                      <Clock className="w-2.5 h-2.5 mx-0.5" />
                      {issue.time_estimate.replace("min", "")}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="quadrant bg-neutral-50 border border-neutral-200 rounded-lg p-4">
          <div className="flex items-center mb-1">
            <AlertCircle className="w-4 h-4 text-neutral-600 mr-1" />
            <h4 className="text-neutral-800 font-medium text-sm">Think Twice</h4>
          </div>
          <p className="text-xs text-neutral-700 mb-2">Consider if worth effort</p>
          <div className="flex flex-wrap gap-2">
            {showEmptyThinkTwice ? (
              <p className="text-xs text-neutral-600 italic">No items in this category</p>
            ) : (
              thinkTwice.map(issue => (
                <div 
                  key={issue.id}
                  className={`px-2 py-1 rounded-md border ${
                    completedItems.includes(issue.id || 0) 
                      ? 'bg-neutral-100 border-neutral-200 text-neutral-500 opacity-60' 
                      : 'bg-neutral-600 border-neutral-700 text-white'
                  } text-xs font-medium cursor-pointer hover:opacity-90 transition-opacity flex items-center`}
                  onClick={() => onIssueClick(issue.id)}
                  title={issue.title}
                >
                  {issue.id}
                  {issue.time_estimate && (
                    <span className="ml-1 text-xs flex items-center">
                      <Clock className="w-2.5 h-2.5 mx-0.5" />
                      {issue.time_estimate.replace("min", "")}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
