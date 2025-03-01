
import React from "react";
import { ImplementationFeedback } from "./types";

interface TimeInvestmentSummaryProps {
  issues: ImplementationFeedback[];
  completedItems: number[];
  timeInvestmentSummary: {
    quickWins: number;
    priorityChanges: number;
    extendedImprovements: number;
    totalTime: string;
  };
}

export const TimeInvestmentSummary = ({
  issues,
  completedItems,
  timeInvestmentSummary
}: TimeInvestmentSummaryProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium mb-3">Time Investment Summary</h3>
      <p className="text-sm text-neutral-600 mb-4">
        This overview shows the estimated time required to implement all recommendations, 
        broken down by category and priority.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-neutral-200 rounded-lg p-5">
          <h4 className="font-medium text-md mb-4">Time Breakdown</h4>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span className="text-sm font-medium">Quick Wins (high impact, low effort)</span>
              </div>
              <span className="font-medium">{timeInvestmentSummary.quickWins} items</span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                <span className="text-sm font-medium">Priority Changes (high/medium)</span>
              </div>
              <span className="font-medium">{timeInvestmentSummary.priorityChanges} items</span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                <span className="text-sm font-medium">Extended Improvements (high effort)</span>
              </div>
              <span className="font-medium">{timeInvestmentSummary.extendedImprovements} items</span>
            </div>
            
            <div className="border-t border-neutral-200 pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Implementation Time</span>
                <span className="font-medium">{timeInvestmentSummary.totalTime}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-neutral-200 rounded-lg p-5">
          <h4 className="font-medium text-md mb-4">Recommended Approach</h4>
          
          <div className="space-y-4">
            <div>
              <h5 className="text-sm font-medium mb-1">Phase 1: Quick Wins</h5>
              <p className="text-sm text-neutral-600">
                Start with high-impact, low-effort changes to see immediate improvements.
                Estimated time: {timeInvestmentSummary.quickWins > 0 ? '1-2 hours' : 'N/A'}
              </p>
            </div>
            
            <div>
              <h5 className="text-sm font-medium mb-1">Phase 2: High Priority Issues</h5>
              <p className="text-sm text-neutral-600">
                Tackle remaining high priority issues that require more effort.
                Focus on those with the highest impact-to-effort ratio.
              </p>
            </div>
            
            <div>
              <h5 className="text-sm font-medium mb-1">Phase 3: Remaining Improvements</h5>
              <p className="text-sm text-neutral-600">
                Address medium and low priority issues as time and resources permit.
                Consider skipping "Think Twice" items unless they align with specific goals.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-5 mt-6">
        <h4 className="font-medium text-md mb-2">Implementation Progress</h4>
        <div className="relative pt-1">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block text-blue-600">
                {completedItems.length} of {issues.length} tasks completed
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-blue-600">
                {Math.round((completedItems.length / issues.length) * 100)}%
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mt-1 text-xs flex rounded bg-neutral-200">
            <div 
              style={{ width: `${(completedItems.length / issues.length) * 100}%` }} 
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500"
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};
