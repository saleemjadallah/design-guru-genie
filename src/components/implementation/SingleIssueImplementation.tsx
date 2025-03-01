
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Clock, FileCode, Tool } from "lucide-react";
import { ImplementationFeedback } from "./types";

interface SingleIssueImplementationProps {
  issue: ImplementationFeedback;
  onBack: () => void;
  isCompleted: boolean;
  onToggleComplete: (id: number) => void;
}

export const SingleIssueImplementation: React.FC<SingleIssueImplementationProps> = ({
  issue,
  onBack,
  isCompleted,
  onToggleComplete
}) => {
  const tools = issue.tools_needed || ["Code editor"];
  const skillLevel = issue.skill_level || "intermediate";
  
  const getSkillLevelClass = () => {
    switch (skillLevel) {
      case "beginner": return "bg-green-50 text-green-700";
      case "intermediate": return "bg-blue-50 text-blue-700";
      case "advanced": return "bg-orange-50 text-orange-700";
      default: return "bg-neutral-50 text-neutral-700";
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onBack}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <h2 className="text-xl font-medium">Implementation Guide</h2>
      </div>

      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-sm mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium">
                Issue #{issue.id}
              </span>
              {issue.priority && (
                <span className={`px-2 py-0.5 rounded text-xs font-medium
                  ${issue.priority === "high" ? "bg-red-100 text-red-700" : 
                    issue.priority === "medium" ? "bg-orange-100 text-orange-700" : 
                    "bg-green-100 text-green-700"}`}>
                  {issue.priority} priority
                </span>
              )}
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSkillLevelClass()}`}>
                {skillLevel} level
              </span>
            </div>
            <h3 className="text-lg font-medium mb-1">{issue.title}</h3>
          </div>
          <Button
            variant={isCompleted ? "outline" : "default"}
            size="sm"
            className={`${isCompleted ? "bg-green-50 text-green-700 border-green-200" : ""}`}
            onClick={() => onToggleComplete(issue.id || 0)}
          >
            {isCompleted ? (
              <>
                <Check className="w-4 h-4 mr-1" />
                Completed
              </>
            ) : (
              "Mark Complete"
            )}
          </Button>
        </div>

        <div className="flex items-center gap-3 mb-4 text-sm text-neutral-600">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span>{issue.time_estimate || "30-60 minutes"}</span>
          </div>
          <div className="flex items-center">
            <FileCode className="w-4 h-4 mr-1" />
            <span>
              {issue.impact === "high" ? "High impact" : 
               issue.impact === "medium" ? "Medium impact" : "Low impact"}
            </span>
          </div>
          <div className="flex items-center">
            <Tool className="w-4 h-4 mr-1" />
            <span>
              {issue.effort === "high" ? "High effort" : 
               issue.effort === "medium" ? "Medium effort" : "Low effort"}
            </span>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="font-medium mb-2">Description</h4>
          <p className="text-neutral-700">{issue.description}</p>
        </div>

        {issue.principle && (
          <div className="mb-6">
            <h4 className="font-medium mb-2">Design Principle</h4>
            <p className="text-neutral-700">{issue.principle}</p>
          </div>
        )}

        <div className="mb-6">
          <h4 className="font-medium mb-2">Implementation Steps</h4>
          <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-100">
            {issue.technical_details ? (
              <div className="prose prose-sm max-w-none">
                {issue.technical_details.split('\n').map((line, i) => (
                  <p key={i} className={i > 0 ? "mt-3" : ""}>
                    {line}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-neutral-600">
                1. Analyze the issue carefully<br/>
                2. Make the necessary code changes<br/>
                3. Test thoroughly to ensure your changes work as expected<br/>
                4. Mark as complete when finished
              </p>
            )}
          </div>
        </div>

        <div className="mb-4">
          <h4 className="font-medium mb-2">Tools Needed</h4>
          <div className="flex flex-wrap gap-2">
            {tools.map((tool, index) => (
              <span key={index} className="px-2 py-1 bg-neutral-100 text-neutral-700 rounded-md text-xs">
                {tool}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
