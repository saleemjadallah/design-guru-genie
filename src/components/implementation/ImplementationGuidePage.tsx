
import React, { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { FileCode, ArrowLeft, CheckCircle2, Download, Clock } from "lucide-react";
import { exportResultsAsPdf } from "@/utils/pdf-export";
import { toast } from "@/hooks/use-toast";

interface Feedback {
  id?: number;
  title: string;
  description: string;
  priority?: "low" | "medium" | "high";
  type: "positive" | "improvement";
  principle?: string;
  technical_details?: string;
  impact?: "low" | "medium" | "high";
  effort?: "low" | "medium" | "high";
  time_estimate?: string;
  tools_needed?: string[];
  skill_level?: "beginner" | "intermediate" | "advanced";
  completed?: boolean;
}

interface ImplementationGuidePageProps {
  issues: Feedback[];
  onClose: () => void;
  selectedIssue?: number | null;
}

export const ImplementationGuidePage = ({ 
  issues, 
  onClose,
  selectedIssue 
}: ImplementationGuidePageProps) => {
  // State for tracking completed items
  const [completedItems, setCompletedItems] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<'matrix' | 'checklist' | 'summary'>('matrix');
  
  // Pre-process issues to add missing properties and compute time estimates
  const processedIssues = issues.map(issue => {
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

  // Sort issues by priority
  const sortedIssues = [...processedIssues].sort((a, b) => {
    const priorityOrder = { high: 1, medium: 2, low: 3, undefined: 4 };
    const aPriority = a.priority || "undefined";
    const bPriority = b.priority || "undefined";
    
    return (priorityOrder[aPriority as keyof typeof priorityOrder]) - 
           (priorityOrder[bPriority as keyof typeof priorityOrder]);
  });

  // Toggle completion status
  const toggleCompleted = (id: number) => {
    if (completedItems.includes(id)) {
      setCompletedItems(completedItems.filter(itemId => itemId !== id));
    } else {
      setCompletedItems([...completedItems, id]);
    }
  };

  // Calculate time investment summary
  const timeInvestmentSummary = {
    quickWins: sortedIssues.filter(issue => 
      issue.impact === "high" && issue.effort === "low").length,
    priorityChanges: sortedIssues.filter(issue => 
      issue.priority === "high" || issue.priority === "medium").length,
    extendedImprovements: sortedIssues.filter(issue => 
      issue.effort === "high").length,
    totalTime: calculateTotalTime(sortedIssues)
  };

  function calculateTotalTime(issues: Feedback[]): string {
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

  // Auto-scroll to selected issue if provided
  React.useEffect(() => {
    if (selectedIssue) {
      const element = document.getElementById(`implementation-${selectedIssue}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setActiveTab('checklist'); // Switch to checklist tab when selecting an issue
      }
    }
  }, [selectedIssue]);

  // Handle PDF export
  const handleExportPdf = () => {
    try {
      exportResultsAsPdf('implementation-guide-content', 'implementation-guide.pdf');
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "Export failed",
        description: "There was an error generating the PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-full overflow-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2"
            onClick={onClose}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <h2 className="text-xl font-bold">Implementation Guide</h2>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleExportPdf}
        >
          <Download className="w-4 h-4 mr-1" />
          Export PDF
        </Button>
      </div>

      <div className="mb-4">
        <p className="text-sm text-neutral-600">
          This guide provides a prioritized implementation plan for all design issues. 
          Follow the recommended sequence to achieve maximum impact with minimum effort.
        </p>
      </div>

      <div className="flex border-b border-neutral-200 mb-6">
        <Button 
          variant="ghost" 
          className={`pb-2 rounded-none ${activeTab === 'matrix' ? 'border-b-2 border-primary' : ''}`}
          onClick={() => setActiveTab('matrix')}
        >
          Impact/Effort Matrix
        </Button>
        <Button 
          variant="ghost" 
          className={`pb-2 rounded-none ${activeTab === 'checklist' ? 'border-b-2 border-primary' : ''}`}
          onClick={() => setActiveTab('checklist')}
        >
          Implementation Checklist
        </Button>
        <Button 
          variant="ghost" 
          className={`pb-2 rounded-none ${activeTab === 'summary' ? 'border-b-2 border-primary' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          Time Investment
        </Button>
      </div>

      <div id="implementation-guide-content" className="pb-16">
        {activeTab === 'matrix' && (
          <div className="implementation-matrix mb-8">
            <h3 className="text-lg font-medium mb-3">Impact vs. Effort Matrix</h3>
            <p className="text-sm text-neutral-600 mb-4">
              This matrix helps prioritize changes based on their impact and required effort.
              Focus first on Quick Wins (high impact, low effort) for maximum effectiveness.
            </p>
            
            <div className="matrix-grid bg-neutral-50 p-4 rounded-lg border border-neutral-200">
              <div className="quadrant bg-green-50 border border-green-200 rounded-lg">
                <h4 className="text-green-800 font-medium text-sm mb-1">Quick Wins</h4>
                <p className="text-xs text-green-700 mb-2">Do these first</p>
                <div className="flex flex-wrap">
                  {sortedIssues
                    .filter(issue => issue.impact === "high" && issue.effort === "low")
                    .map(issue => (
                      <div 
                        key={issue.id}
                        className={`recommendation-marker bg-green-600 cursor-pointer ${issue.completed ? 'opacity-50' : ''}`}
                        onClick={() => {
                          const element = document.getElementById(`implementation-${issue.id}`);
                          if (element) {
                            setActiveTab('checklist');
                            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }}
                      >
                        {issue.id}
                      </div>
                    ))}
                </div>
              </div>
              
              <div className="quadrant bg-orange-50 border border-orange-200 rounded-lg">
                <h4 className="text-orange-800 font-medium text-sm mb-1">Major Projects</h4>
                <p className="text-xs text-orange-700 mb-2">Plan and prioritize</p>
                <div className="flex flex-wrap">
                  {sortedIssues
                    .filter(issue => issue.impact === "high" && issue.effort === "high")
                    .map(issue => (
                      <div 
                        key={issue.id}
                        className={`recommendation-marker bg-orange-600 cursor-pointer ${issue.completed ? 'opacity-50' : ''}`}
                        onClick={() => {
                          const element = document.getElementById(`implementation-${issue.id}`);
                          if (element) {
                            setActiveTab('checklist');
                            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }}
                      >
                        {issue.id}
                      </div>
                    ))}
                </div>
              </div>
              
              <div className="quadrant bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-blue-800 font-medium text-sm mb-1">Fill-Ins</h4>
                <p className="text-xs text-blue-700 mb-2">Do when time permits</p>
                <div className="flex flex-wrap">
                  {sortedIssues
                    .filter(issue => issue.impact === "low" && issue.effort === "low")
                    .map(issue => (
                      <div 
                        key={issue.id}
                        className={`recommendation-marker bg-blue-600 cursor-pointer ${issue.completed ? 'opacity-50' : ''}`}
                        onClick={() => {
                          const element = document.getElementById(`implementation-${issue.id}`);
                          if (element) {
                            setActiveTab('checklist');
                            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }}
                      >
                        {issue.id}
                      </div>
                    ))}
                </div>
              </div>
              
              <div className="quadrant bg-neutral-50 border border-neutral-200 rounded-lg">
                <h4 className="text-neutral-800 font-medium text-sm mb-1">Think Twice</h4>
                <p className="text-xs text-neutral-700 mb-2">Consider if worth effort</p>
                <div className="flex flex-wrap">
                  {sortedIssues
                    .filter(issue => issue.impact === "low" && issue.effort === "high")
                    .map(issue => (
                      <div 
                        key={issue.id}
                        className={`recommendation-marker bg-neutral-600 cursor-pointer ${issue.completed ? 'opacity-50' : ''}`}
                        onClick={() => {
                          const element = document.getElementById(`implementation-${issue.id}`);
                          if (element) {
                            setActiveTab('checklist');
                            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }}
                      >
                        {issue.id}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'checklist' && (
          <div className="space-y-8">
            <h3 className="text-lg font-medium mb-3">Implementation Checklist</h3>
            <p className="text-sm text-neutral-600 mb-4">
              Follow this recommended sequence for implementing changes. Items are ordered by priority and impact-to-effort ratio.
            </p>
            
            {sortedIssues.map((issue, index) => (
              <div 
                key={issue.id} 
                id={`implementation-${issue.id}`}
                className={`border rounded-lg p-5 transition-all ${
                  issue.completed ? 'border-green-200 bg-green-50' : 'border-neutral-200'
                } ${selectedIssue === issue.id ? 'ring-2 ring-primary' : ''}`}
              >
                <div className="flex items-start">
                  <button 
                    className={`mt-1 mr-3 rounded-full flex-shrink-0 ${
                      issue.completed ? 'text-green-500' : 'text-neutral-300 hover:text-neutral-400'
                    }`}
                    onClick={() => toggleCompleted(issue.id || 0)}
                  >
                    <CheckCircle2 className={`w-5 h-5 ${issue.completed ? 'fill-green-500' : ''}`} />
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
        )}

        {activeTab === 'summary' && (
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
                      {completedItems.length} of {sortedIssues.length} tasks completed
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-blue-600">
                      {Math.round((completedItems.length / sortedIssues.length) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mt-1 text-xs flex rounded bg-neutral-200">
                  <div 
                    style={{ width: `${(completedItems.length / sortedIssues.length) * 100}%` }} 
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
