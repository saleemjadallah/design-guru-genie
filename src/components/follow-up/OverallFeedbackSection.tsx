
import React from "react";

interface OverallFeedbackSectionProps {
  feedback: string;
}

export const OverallFeedbackSection = ({ 
  feedback 
}: OverallFeedbackSectionProps) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Overall Feedback</h2>
      <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{feedback}</p>
    </div>
  );
};
