
import { Check, AlertCircle } from "lucide-react";

type Feedback = {
  type: "positive" | "improvement";
  title: string;
  description: string;
  priority?: "low" | "medium" | "high";
};

type Props = {
  positiveFeatures: Feedback[];
  getIssueCountByPriority: (priority: string) => number;
  isUrlAnalysis?: boolean;
};

export const Overview = ({ 
  positiveFeatures, 
  getIssueCountByPriority,
  isUrlAnalysis = false
}: Props) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-neutral-900 mb-4">
          {isUrlAnalysis ? "Website Analysis" : "Design Analysis"}
        </h2>
        <p className="text-neutral-700">
          {isUrlAnalysis 
            ? "This website has been analyzed by our AI to identify design strengths and areas for improvement. Review the feedback below to enhance user experience and conversion rates."
            : "This design has been analyzed by our AI to identify strengths and areas for improvement. Review the feedback below to enhance user experience and conversion rates."}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        <div className="flex-1 border border-green-100 bg-green-50 rounded-lg p-4">
          <h3 className="font-medium text-green-800 flex items-center gap-2 mb-3">
            <Check size={16} className="text-green-600" />
            Design Strengths
          </h3>
          <ul className="space-y-4">
            {positiveFeatures.map((strength, index) => (
              <li key={index}>
                <h4 className="font-medium text-neutral-900">{strength.title}</h4>
                <p className="text-sm text-neutral-600">{strength.description}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex-1 border border-neutral-200 rounded-lg p-4">
          <h3 className="font-medium text-neutral-800 flex items-center gap-2 mb-3">
            <AlertCircle size={16} />
            Issues Breakdown
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                High Priority
              </span>
              <span className="text-sm font-medium">
                {getIssueCountByPriority('high')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                Medium Priority
              </span>
              <span className="text-sm font-medium">
                {getIssueCountByPriority('medium')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Low Priority
              </span>
              <span className="text-sm font-medium">
                {getIssueCountByPriority('low')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
