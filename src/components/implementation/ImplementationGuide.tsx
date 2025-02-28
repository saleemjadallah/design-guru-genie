
import { useState } from "react";
import { X, CheckSquare, ArrowRight, Clock, Tool, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Feedback = {
  type: "positive" | "improvement";
  title: string;
  description: string;
  priority?: "low" | "medium" | "high";
  location?: { x: number; y: number };
  id?: number;
  principle?: string;
  technical_details?: string;
};

interface ImplementationItem extends Feedback {
  impact: "low" | "medium" | "high";
  effort: "low" | "medium" | "high";
  timeEstimate: string;
  tools?: string[];
  skillLevel?: "beginner" | "intermediate" | "advanced";
  implementation?: string;
  completed?: boolean;
}

type Props = {
  issues: Feedback[];
  onClose: () => void;
};

export const ImplementationGuide = ({ issues, onClose }: Props) => {
  // Process the feedback items to add implementation details
  const implementationItems: ImplementationItem[] = issues.map((issue) => {
    // Create implementation details based on priority and issue type
    let impact: "low" | "medium" | "high" = issue.priority as "low" | "medium" | "high" || "medium";
    
    // Determine effort based on a combination of priority and description length
    // This is a simple heuristic - in a real app this would use more sophisticated logic
    let effort: "low" | "medium" | "high";
    if (issue.description.length > 200) {
      effort = "high";
    } else if (issue.description.length > 100) {
      effort = "medium";
    } else {
      effort = "low";
    }
    
    // Generate time estimates based on effort
    let timeEstimate = "";
    if (effort === "low") {
      timeEstimate = "15-30 minutes";
    } else if (effort === "medium") {
      timeEstimate = "1-2 hours";
    } else {
      timeEstimate = "3+ hours";
    }
    
    // Determine skill level needed
    const skillLevel = effort === "high" ? "advanced" : 
                        effort === "medium" ? "intermediate" : "beginner";
    
    // Derive simple implementation instructions from the description
    const implementation = issue.technical_details || 
      `Follow best practices to ${issue.title.toLowerCase()}.`;
    
    // Determine tools needed based on issue type
    const tools = ["Code editor"];
    if (issue.description.toLowerCase().includes("color") || 
        issue.description.toLowerCase().includes("contrast") ||
        issue.description.toLowerCase().includes("visual")) {
      tools.push("Color picker");
    }
    if (issue.description.toLowerCase().includes("image") || 
        issue.description.toLowerCase().includes("photo") || 
        issue.description.toLowerCase().includes("graphic")) {
      tools.push("Image editor");
    }
    
    return {
      ...issue,
      impact,
      effort,
      timeEstimate,
      tools,
      skillLevel,
      implementation,
      completed: false,
    };
  });
  
  // Track which implementation items are completed
  const [completedItems, setCompletedItems] = useState<number[]>([]);
  
  // Toggle completion status of an item
  const toggleItemCompletion = (id: number) => {
    if (completedItems.includes(id)) {
      setCompletedItems(completedItems.filter(itemId => itemId !== id));
    } else {
      setCompletedItems([...completedItems, id]);
    }
  };

  // Calculate implementation time summary
  const quickWins = implementationItems.filter(
    item => item.impact === "high" && item.effort === "low"
  ).length;
  
  const priorityChanges = implementationItems.filter(
    item => item.priority === "high" || item.priority === "medium"
  ).length;
  
  const extendedImprovements = implementationItems.filter(
    item => item.effort === "high"
  ).length;
  
  const totalTime = implementationItems.reduce((total, item) => {
    if (item.effort === "low") return total + 0.5;
    if (item.effort === "medium") return total + 1.5;
    return total + 3;
  }, 0);

  // Sort items for the implementation checklist - prioritizing by impact then effort
  const sortedItems = [...implementationItems].sort((a, b) => {
    // First sort by impact (high to low)
    const impactOrder = { high: 0, medium: 1, low: 2 };
    if (impactOrder[a.impact] !== impactOrder[b.impact]) {
      return impactOrder[a.impact] - impactOrder[b.impact];
    }
    
    // Then by effort (low to high)
    const effortOrder = { low: 0, medium: 1, high: 2 };
    return effortOrder[a.effort] - effortOrder[b.effort];
  });

  // Handle export to PDF (mock functionality)
  const handleExport = () => {
    toast({
      title: "Export initiated",
      description: "Your implementation guide is being prepared for download.",
    });
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg max-w-5xl mx-auto p-6 overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-neutral-900">Prioritized Implementation Guide</h2>
        <button 
          onClick={onClose}
          className="text-neutral-500 hover:text-neutral-700"
        >
          <X size={24} />
        </button>
      </div>
      
      {/* Introduction section */}
      <div className="mb-8">
        <p className="text-neutral-700">
          This guide organizes design recommendations into an actionable plan based on impact and effort. 
          Follow the suggested sequence to maximize the value of your design improvements.
        </p>
      </div>
      
      {/* Impact vs Effort Matrix */}
      <div className="mb-10">
        <h3 className="text-lg font-semibold mb-4">Impact vs. Effort Matrix</h3>
        <div className="relative border border-neutral-200 rounded-lg p-1">
          {/* Axis labels */}
          <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-8 transform rotate-90 origin-center">
            <span className="text-sm font-medium text-neutral-600">Impact</span>
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-6">
            <span className="text-sm font-medium text-neutral-600">Effort</span>
          </div>
          
          {/* Matrix grid */}
          <div className="grid grid-cols-2 gap-4 p-4">
            {/* Quadrant 1: High Impact, Low Effort (Quick Wins) */}
            <div className="border border-green-100 bg-green-50 rounded-lg p-4 h-48">
              <h4 className="font-medium text-green-800">Quick Wins</h4>
              <p className="text-xs text-green-700 mb-2">Implement first</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {implementationItems
                  .filter(item => item.impact === "high" && item.effort === "low")
                  .map(item => (
                    <div 
                      key={item.id}
                      className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-sm"
                      title={item.title}
                    >
                      {item.id}
                    </div>
                  ))}
              </div>
            </div>
            
            {/* Quadrant 2: High Impact, High Effort (Major Projects) */}
            <div className="border border-amber-100 bg-amber-50 rounded-lg p-4 h-48">
              <h4 className="font-medium text-amber-800">Major Projects</h4>
              <p className="text-xs text-amber-700 mb-2">Plan and prioritize</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {implementationItems
                  .filter(item => item.impact === "high" && item.effort === "high")
                  .map(item => (
                    <div 
                      key={item.id}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        item.priority === "high" ? "bg-red-500" : 
                        item.priority === "medium" ? "bg-amber-500" : "bg-blue-500"
                      }`}
                      title={item.title}
                    >
                      {item.id}
                    </div>
                  ))}
              </div>
            </div>
            
            {/* Quadrant 3: Low Impact, Low Effort (Fill-Ins) */}
            <div className="border border-blue-100 bg-blue-50 rounded-lg p-4 h-48">
              <h4 className="font-medium text-blue-800">Fill-Ins</h4>
              <p className="text-xs text-blue-700 mb-2">Do when time permits</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {implementationItems
                  .filter(item => item.impact === "low" && item.effort === "low")
                  .map(item => (
                    <div 
                      key={item.id}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        item.priority === "high" ? "bg-red-500" : 
                        item.priority === "medium" ? "bg-amber-500" : "bg-blue-500"
                      }`}
                      title={item.title}
                    >
                      {item.id}
                    </div>
                  ))}
              </div>
            </div>
            
            {/* Quadrant 4: Low Impact, High Effort (Think Twice) */}
            <div className="border border-neutral-200 bg-neutral-50 rounded-lg p-4 h-48">
              <h4 className="font-medium text-neutral-800">Think Twice</h4>
              <p className="text-xs text-neutral-600 mb-2">Consider if worth effort</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {implementationItems
                  .filter(item => item.impact === "low" && item.effort === "high")
                  .map(item => (
                    <div 
                      key={item.id}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        item.priority === "high" ? "bg-red-500" : 
                        item.priority === "medium" ? "bg-amber-500" : "bg-blue-500"
                      }`}
                      title={item.title}
                    >
                      {item.id}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Implementation Checklist */}
      <div className="mb-10">
        <h3 className="text-lg font-semibold mb-4">Sequenced Implementation Checklist</h3>
        <div className="space-y-4">
          {sortedItems.map((item, index) => (
            <div 
              key={item.id}
              className={`border rounded-lg p-4 ${
                completedItems.includes(item.id!) ? 'bg-neutral-50 border-neutral-200' : 
                item.priority === 'high' ? 'border-red-200' :
                item.priority === 'medium' ? 'border-amber-200' :
                'border-blue-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleItemCompletion(item.id!)}
                  className="mt-0.5 text-neutral-400 hover:text-accent transition-colors"
                >
                  <CheckSquare 
                    size={20} 
                    className={completedItems.includes(item.id!) ? 'text-green-500 fill-green-500' : ''}
                  />
                </button>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`font-medium ${
                      completedItems.includes(item.id!) ? 'text-neutral-500 line-through' : 'text-neutral-900'
                    }`}>
                      {index + 1}. {item.title}
                    </h4>
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded ${
                      item.priority === 'high' ? 'bg-red-100 text-red-800' : 
                      item.priority === 'medium' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {item.priority} priority
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                    <div className="flex items-center gap-2">
                      <div className="text-accent">
                        <ArrowRight size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-neutral-500">Impact</p>
                        <p className="text-sm text-neutral-800">{item.impact.charAt(0).toUpperCase() + item.impact.slice(1)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="text-accent">
                        <Clock size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-neutral-500">Effort</p>
                        <p className="text-sm text-neutral-800">{item.timeEstimate}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="text-accent">
                        <Tool size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-neutral-500">Skill Level</p>
                        <p className="text-sm text-neutral-800">{item.skillLevel}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 bg-neutral-50 rounded p-3">
                    <p className="text-sm text-neutral-700">{item.implementation}</p>
                  </div>
                  
                  {item.tools && item.tools.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {item.tools.map((tool, i) => (
                        <span 
                          key={i}
                          className="inline-flex items-center px-2 py-1 rounded text-xs bg-neutral-100 text-neutral-700"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Time Investment Summary */}
      <div className="mb-10">
        <h3 className="text-lg font-semibold mb-4">Time Investment Summary</h3>
        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <ul className="space-y-3">
                <li className="flex items-center justify-between">
                  <span className="text-neutral-700">Quick Wins (under 1 hour):</span>
                  <span className="font-medium text-neutral-900">{quickWins} items</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-neutral-700">Priority Changes (1-3 hours):</span>
                  <span className="font-medium text-neutral-900">{priorityChanges} items</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-neutral-700">Extended Improvements (3+ hours):</span>
                  <span className="font-medium text-neutral-900">{extendedImprovements} items</span>
                </li>
                <li className="flex items-center justify-between pt-2 border-t border-neutral-200">
                  <span className="text-neutral-800 font-medium">Complete Implementation:</span>
                  <span className="font-bold text-neutral-900">~{totalTime.toFixed(1)} hours</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-neutral-800 mb-3">Suggested Phasing</h4>
              <div className="space-y-2">
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <p className="text-sm text-green-800">
                    <span className="font-medium">Phase 1 (Day 1):</span> Implement all quick wins
                  </p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded p-3">
                  <p className="text-sm text-amber-800">
                    <span className="font-medium">Phase 2 (Week 1):</span> Address high-impact, medium-effort items
                  </p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">Phase 3 (Month 1):</span> Plan and execute major projects
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Export Button */}
      <div className="flex justify-end">
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-md transition-colors"
        >
          <Download size={16} />
          Export Implementation Plan
        </button>
      </div>
    </div>
  );
};
