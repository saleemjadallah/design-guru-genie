
import { Check, AlertCircle, Copy, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useState, useRef, useEffect } from "react";
import { ImplementationGuide } from "./implementation/ImplementationGuide";

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
  isUrlAnalysis?: boolean;
};

export const FeedbackPanel = ({ 
  feedback, 
  selectedIssue,
  onIssueSelect,
  isUrlAnalysis = false
}: Props) => {
  const [showImplementationGuide, setShowImplementationGuide] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowImplementationGuide(false);
      }
    };
    
    if (showImplementationGuide) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [showImplementationGuide]);
  
  const handleCopyRecommendation = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The recommendation has been copied to your clipboard.",
    });
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm divide-y divide-neutral-200">
        <div className="p-4 flex justify-between items-center">
          <div>
            <h3 className="font-medium text-neutral-900 mb-2">Issues & Recommendations</h3>
            <p className="text-sm text-neutral-500">
              {isUrlAnalysis 
                ? "Improvements suggested for this website design" 
                : "Click on an issue to see detailed recommendations"}
            </p>
          </div>
          
          {feedback.length > 0 && (
            <button 
              onClick={() => setShowImplementationGuide(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors text-sm"
            >
              <FileText size={14} />
              Implementation Guide
            </button>
          )}
        </div>
        
        <div className="max-h-[600px] overflow-y-auto">
          {feedback.length === 0 ? (
            <div className="p-8 text-center text-neutral-500">
              No issues found matching the current filter.
            </div>
          ) : (
            feedback.map(issue => (
              <div 
                key={issue.id}
                className={`p-4 ${isUrlAnalysis ? 'border-b border-neutral-100 last:border-b-0' : 'cursor-pointer transition-colors'} ${
                  selectedIssue === issue.id ? 'bg-neutral-50' : ''
                }`}
                onClick={() => !isUrlAnalysis && onIssueSelect?.(issue.id || null)}
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
                    
                    {/* Always show details for URL analysis */}
                    {(selectedIssue === issue.id || isUrlAnalysis) && issue.technical_details && (
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
            ))
          )}
        </div>
      </div>
      
      {/* Implementation Guide Modal */}
      {showImplementationGuide && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div 
            ref={modalRef}
            className="max-w-5xl w-full my-8"
          >
            <ImplementationGuide 
              issues={feedback} 
              onClose={() => setShowImplementationGuide(false)} 
            />
          </div>
        </div>
      )}
    </>
  );
};
