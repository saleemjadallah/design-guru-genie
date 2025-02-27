
import { Check, AlertCircle, Copy } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Feedback = {
  type: "positive" | "improvement";
  title: string;
  description: string;
  priority?: "low" | "medium" | "high";
  id?: number;
  principle?: string;
  technical_details?: string;
};

type Props = {
  feedback: Feedback[];
  strengths: Feedback[];
  onSave: (feedback: Feedback[]) => void;
  selectedIssue?: number | null;
  onIssueSelect?: (id: number | null) => void;
};

export const FeedbackPanel = ({ 
  feedback, 
  selectedIssue,
  onIssueSelect 
}: Props) => {
  const handleCopyRecommendation = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The recommendation has been copied to your clipboard.",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm divide-y divide-neutral-200">
      <div className="p-4">
        <h3 className="font-medium text-neutral-900 mb-2">Issues & Recommendations</h3>
        <p className="text-sm text-neutral-500">
          Click on an issue to see detailed recommendations
        </p>
      </div>
      
      <div className="max-h-[600px] overflow-y-auto">
        {feedback.map(issue => (
          <div 
            key={issue.id}
            className={`p-4 cursor-pointer transition-colors ${
              selectedIssue === issue.id ? 'bg-neutral-50' : ''
            }`}
            onClick={() => onIssueSelect?.(issue.id || null)}
          >
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                issue.priority === 'high' ? 'bg-red-500' : 
                issue.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
              }`}>
                <span className="text-white text-xs font-bold">{issue.id}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-neutral-900">{issue.title}</h4>
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded ${
                    issue.priority === 'high' ? 'bg-red-100 text-red-800' : 
                    issue.priority === 'medium' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {issue.priority} priority
                  </span>
                </div>
                <p className="text-sm text-neutral-700">{issue.description}</p>
                
                {selectedIssue === issue.id && issue.technical_details && (
                  <div className="mt-3 pt-3 border-t border-neutral-100">
                    {issue.principle && (
                      <div className="mb-3">
                        <span className="inline-block text-xs font-medium bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded">
                          {issue.principle}
                        </span>
                      </div>
                    )}
                    
                    <div className="bg-neutral-50 rounded p-2 mb-3">
                      <p className="text-xs text-neutral-600">{issue.technical_details}</p>
                    </div>
                    
                    <button 
                      className="flex items-center text-xs text-accent hover:text-accent/80"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyRecommendation(issue.description);
                      }}
                    >
                      <Copy size={14} className="mr-1" />
                      Copy recommendation
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
