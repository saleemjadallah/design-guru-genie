
import { ImplementationFeedback } from "./types";

export function calculateTotalTime(issues: ImplementationFeedback[]): string {
  let minTime = 0;
  let maxTime = 0;
  
  issues.forEach(issue => {
    if (issue.time_estimate) {
      if (issue.time_estimate.includes("minutes")) {
        const range = issue.time_estimate.split("-");
        if (range.length === 2) {
          minTime += parseInt(range[0]) / 60; // Convert minutes to hours
          maxTime += parseInt(range[1].split(" ")[0]) / 60;
        } else {
          // Handle single value like "30 minutes"
          const value = parseInt(issue.time_estimate);
          if (!isNaN(value)) {
            minTime += value / 60;
            maxTime += value / 60;
          }
        }
      } else if (issue.time_estimate.includes("hours")) {
        const range = issue.time_estimate.split("-");
        if (range.length === 2) {
          minTime += parseInt(range[0]);
          maxTime += parseInt(range[1].split(" ")[0]);
        } else if (issue.time_estimate.includes("+")) {
          // Handle "3+ hours" format
          const value = parseInt(issue.time_estimate);
          if (!isNaN(value)) {
            minTime += value;
            maxTime += value * 1.5; // Estimate max as 50% more than minimum
          }
        } else {
          // Handle single value like "2 hours"
          const value = parseInt(issue.time_estimate);
          if (!isNaN(value)) {
            minTime += value;
            maxTime += value;
          }
        }
      }
    }
  });
  
  return `${Math.round(minTime)}-${Math.round(maxTime)} hours`;
}

export function processIssues(issues: ImplementationFeedback[], completedItems: number[]): ImplementationFeedback[] {
  // Pre-process issues to add missing properties
  return issues.map(issue => {
    // Default values for missing properties
    const impact = issue.impact || (issue.priority === "high" ? "high" : issue.priority === "medium" ? "medium" : "low");
    const effort = issue.effort || "medium"; // Default effort
    
    // Default time estimates based on effort
    const time_estimate = issue.time_estimate || 
      (effort === "low" ? "15-30 minutes" : 
       effort === "medium" ? "1-2 hours" : 
       "3+ hours");
    
    // Default tools and skill level
    const tools_needed = issue.tools_needed || ["Code editor"];
    const skill_level = issue.skill_level || "intermediate";
    
    return {
      ...issue,
      impact,
      effort,
      time_estimate,
      tools_needed,
      skill_level,
      completed: completedItems.includes(issue.id || 0)
    };
  });
}

export function sortIssuesByPriority(issues: ImplementationFeedback[]): ImplementationFeedback[] {
  return [...issues].sort((a, b) => {
    const priorityOrder = { high: 1, medium: 2, low: 3, undefined: 4 };
    const aPriority = a.priority || "undefined";
    const bPriority = b.priority || "undefined";
    
    return (priorityOrder[aPriority as keyof typeof priorityOrder]) - 
           (priorityOrder[bPriority as keyof typeof priorityOrder]);
  });
}
