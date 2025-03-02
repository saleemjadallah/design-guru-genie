
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check } from "lucide-react";
import { ImplementationFeedback } from "./types";

interface IssueHeaderProps {
  issue: ImplementationFeedback;
  onBack: () => void;
  isCompleted: boolean;
  onToggleComplete: (id: number) => void;
}

export const IssueHeader: React.FC<IssueHeaderProps> = ({
  issue,
  onBack,
  isCompleted,
  onToggleComplete
}) => {
  const getSkillLevelClass = () => {
    const skillLevel = issue.skill_level || "intermediate";
    switch (skillLevel) {
      case "beginner": return "bg-green-50 text-green-700";
      case "intermediate": return "bg-blue-50 text-blue-700";
      case "advanced": return "bg-orange-50 text-orange-700";
      default: return "bg-neutral-50 text-neutral-700";
    }
  };

  const handleToggleComplete = () => {
    if (issue.id !== undefined) {
      console.log("Toggling completion for issue:", issue.id);
      onToggleComplete(issue.id);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onBack}
          className="flex items-center gap-1"
          type="button"
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
                {issue.skill_level || "intermediate"} level
              </span>
            </div>
            <h3 className="text-lg font-medium mb-1">{issue.title}</h3>
          </div>
          <Button
            variant={isCompleted ? "outline" : "default"}
            size="sm"
            className={`${isCompleted ? "bg-green-50 text-green-700 border-green-200" : ""}`}
            onClick={handleToggleComplete}
            type="button"
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
      </div>
    </>
  );
};
