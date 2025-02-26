
import { useState } from "react";
import { Check, AlertCircle, ArrowRight } from "lucide-react";

type Feedback = {
  type: "positive" | "improvement";
  title: string;
  description: string;
  priority?: "low" | "medium" | "high";
};

type Props = {
  feedback: Feedback[];
  onSave: (feedback: Feedback[]) => void;
};

export const FeedbackPanel = ({ feedback, onSave }: Props) => {
  const [newFeedback, setNewFeedback] = useState<Feedback>({
    type: "positive",
    title: "",
    description: "",
    priority: "medium",
  });

  const addFeedback = () => {
    if (newFeedback.title && newFeedback.description) {
      const updatedFeedback = [...feedback, newFeedback];
      onSave(updatedFeedback);
      setNewFeedback({
        type: "positive",
        title: "",
        description: "",
        priority: "medium",
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-2xl font-semibold mb-6">Design Feedback</h2>
      
      <div className="space-y-4 mb-8">
        {feedback.map((item, index) => (
          <div
            key={index}
            className="p-4 rounded-lg bg-neutral-50 border animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center gap-2 mb-2">
              {item.type === "positive" ? (
                <Check className="w-5 h-5 text-success-dark" />
              ) : (
                <AlertCircle className="w-5 h-5 text-warning-dark" />
              )}
              <h3 className="font-semibold text-neutral-800">{item.title}</h3>
            </div>
            <p className="text-neutral-600 ml-7">{item.description}</p>
            {item.priority && (
              <div className="mt-2 ml-7">
                <span
                  className={`inline-block px-2 py-1 text-xs rounded-full ${
                    item.priority === "high"
                      ? "bg-warning-light/20 text-warning-dark"
                      : item.priority === "medium"
                      ? "bg-accent-light/20 text-accent-dark"
                      : "bg-neutral-200 text-neutral-700"
                  }`}
                >
                  {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)} Priority
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Feedback Type
          </label>
          <select
            value={newFeedback.type}
            onChange={(e) =>
              setNewFeedback({ ...newFeedback, type: e.target.value as "positive" | "improvement" })
            }
            className="w-full p-2 border rounded-md bg-white"
          >
            <option value="positive">Positive</option>
            <option value="improvement">Improvement</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Title
          </label>
          <input
            type="text"
            value={newFeedback.title}
            onChange={(e) =>
              setNewFeedback({ ...newFeedback, title: e.target.value })
            }
            className="w-full p-2 border rounded-md"
            placeholder="Enter feedback title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Description
          </label>
          <textarea
            value={newFeedback.description}
            onChange={(e) =>
              setNewFeedback({ ...newFeedback, description: e.target.value })
            }
            className="w-full p-2 border rounded-md"
            placeholder="Enter detailed feedback"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Priority
          </label>
          <select
            value={newFeedback.priority}
            onChange={(e) =>
              setNewFeedback({
                ...newFeedback,
                priority: e.target.value as "low" | "medium" | "high",
              })
            }
            className="w-full p-2 border rounded-md bg-white"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <button
          onClick={addFeedback}
          className="w-full bg-accent hover:bg-accent-dark text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
        >
          Add Feedback
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
