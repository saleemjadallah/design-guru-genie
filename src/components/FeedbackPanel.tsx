
import { Check, AlertCircle } from "lucide-react";

type Feedback = {
  type: "positive" | "improvement";
  title: string;
  description: string;
  priority?: "low" | "medium" | "high";
  id?: number;
};

type Props = {
  feedback: Feedback[];
  onSave: (feedback: Feedback[]) => void;
};

export const FeedbackPanel = ({ feedback, onSave }: Props) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-2xl font-semibold mb-6">Design Feedback</h2>
      
      <div className="space-y-6">
        {/* Positive Feedback Section */}
        {feedback.filter(item => item.type === "positive").length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-neutral-800">Strengths</h3>
            {feedback
              .filter(item => item.type === "positive")
              .map((item, index) => (
                <div key={index} className="p-4 rounded-lg bg-neutral-50 border animate-slide-up">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="w-5 h-5 text-success-dark" />
                    <h4 className="font-medium text-neutral-800">{item.title}</h4>
                  </div>
                  <p className="text-neutral-600 ml-7">{item.description}</p>
                </div>
              ))}
          </div>
        )}

        {/* Improvements Section */}
        {feedback.filter(item => item.type === "improvement").length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-neutral-800">Suggested Improvements</h3>
            {feedback
              .filter(item => item.type === "improvement")
              .map((item, index) => (
                <div key={index} className="p-4 rounded-lg bg-neutral-50 border animate-slide-up">
                  <div className="flex items-start gap-3">
                    <div 
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-medium shrink-0
                        ${item.priority === "high" 
                          ? "bg-red-500" 
                          : item.priority === "medium" 
                          ? "bg-amber-500" 
                          : "bg-blue-500"
                        }`}
                    >
                      {item.id || index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-5 h-5 text-warning-dark" />
                        <h4 className="font-medium text-neutral-800">{item.title}</h4>
                      </div>
                      <p className="text-neutral-600 mb-2">{item.description}</p>
                      {item.priority && (
                        <span className={`inline-block px-2 py-1 text-xs rounded-full 
                          ${item.priority === "high"
                            ? "bg-warning-light/20 text-warning-dark"
                            : item.priority === "medium"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)} Priority
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};
