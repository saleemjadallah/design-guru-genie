
import { Star, AlertTriangle, AlertCircle, ThumbsUp } from "lucide-react";

interface Feedback {
  type: "positive" | "improvement";
  title: string;
  description: string;
  priority?: "low" | "medium" | "high";
  location?: { x: number; y: number };
  id?: number;
  principle?: string;
  technical_details?: string;
}

interface Props {
  positiveFeatures: Feedback[];
  getIssueCountByPriority: (priority: string) => number;
  isUrlAnalysis?: boolean;
}

export const Overview = ({ 
  positiveFeatures, 
  getIssueCountByPriority,
  isUrlAnalysis = false
}: Props) => {
  const issueCount = 
    getIssueCountByPriority("high") + 
    getIssueCountByPriority("medium") + 
    getIssueCountByPriority("low");

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
      <h2 className="font-semibold text-xl mb-4">Overview</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4 mb-6">
        <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-100">
          <div className="flex items-center mb-2">
            <ThumbsUp className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="font-medium text-neutral-800">Strengths</h3>
          </div>
          <p className="text-sm text-neutral-600">
            {positiveFeatures.length} positive aspects identified
          </p>
        </div>

        <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-100">
          <div className="flex items-center mb-2">
            <AlertCircle className="w-5 h-5 text-orange-500 mr-2" />
            <h3 className="font-medium text-neutral-800">Issues</h3>
          </div>
          <p className="text-sm text-neutral-600">
            {issueCount} areas for improvement
          </p>
        </div>
      </div>

      {!isUrlAnalysis && (
        <div className="space-y-4">
          <h3 className="font-medium text-neutral-800 text-sm">Issues by priority</h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-red-50 p-3 rounded-lg border border-red-100">
              <div className="text-center">
                <span className="font-medium text-red-800 block text-lg">
                  {getIssueCountByPriority("high")}
                </span>
                <span className="text-xs text-red-700">High priority</span>
              </div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
              <div className="text-center">
                <span className="font-medium text-orange-800 block text-lg">
                  {getIssueCountByPriority("medium")}
                </span>
                <span className="text-xs text-orange-700">Medium priority</span>
              </div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg border border-green-100">
              <div className="text-center">
                <span className="font-medium text-green-800 block text-lg">
                  {getIssueCountByPriority("low")}
                </span>
                <span className="text-xs text-green-700">Low priority</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Positives List */}
      <div className="mt-6">
        <h3 className="font-medium text-neutral-800 text-sm mb-3">Design Strengths</h3>
        <div className="space-y-2">
          {positiveFeatures.map((feature, index) => (
            <div key={index} className="bg-neutral-50 p-3 rounded-lg border border-neutral-100">
              <div className="flex items-start">
                <Star className="w-4 h-4 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-neutral-800 text-sm">{feature.title}</h4>
                  <p className="text-xs text-neutral-600 mt-1">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
          {positiveFeatures.length === 0 && (
            <div className="text-center py-3 text-neutral-500 text-sm">
              No strengths identified yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
