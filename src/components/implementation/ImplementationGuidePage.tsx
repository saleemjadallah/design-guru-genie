
import React from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { FileCode, ArrowLeft } from "lucide-react";

interface Feedback {
  id?: number;
  title: string;
  description: string;
  priority?: "low" | "medium" | "high";
  type: "positive" | "improvement";
  principle?: string;
  technical_details?: string;
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
  const sortedIssues = [...issues].sort((a, b) => {
    const priorityOrder = { high: 1, medium: 2, low: 3, undefined: 4 };
    const aPriority = a.priority || "undefined";
    const bPriority = b.priority || "undefined";
    
    return (priorityOrder[aPriority as keyof typeof priorityOrder]) - 
           (priorityOrder[bPriority as keyof typeof priorityOrder]);
  });

  // Auto-scroll to selected issue if provided
  React.useEffect(() => {
    if (selectedIssue) {
      const element = document.getElementById(`implementation-${selectedIssue}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [selectedIssue]);

  return (
    <div className="h-full overflow-auto">
      <div className="flex items-center mb-6">
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

      <div className="mb-4">
        <p className="text-sm text-neutral-600">
          This guide provides implementation recommendations for all design issues. 
          Issues are sorted by priority with high priority items at the top.
        </p>
      </div>

      <div className="space-y-8">
        {sortedIssues.map((issue) => (
          <div 
            key={issue.id} 
            id={`implementation-${issue.id}`}
            className="border border-neutral-200 rounded-lg p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-medium text-lg">{issue.title}</h3>
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
            
            {issue.principle && (
              <div className="bg-neutral-50 p-3 rounded-md mb-4">
                <span className="text-sm font-medium">Design Principle: </span>
                <span className="text-sm">{issue.principle}</span>
              </div>
            )}
            
            {issue.technical_details && (
              <div className="bg-neutral-50 p-3 rounded-md">
                <h4 className="text-sm font-medium mb-2">Implementation Details:</h4>
                <div className="text-sm whitespace-pre-wrap">
                  {issue.technical_details}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
