
import React from "react";

interface OverallFeedbackSectionProps {
  feedback: string;
}

export const OverallFeedbackSection = ({ 
  feedback 
}: OverallFeedbackSectionProps) => {
  // Split feedback into paragraphs for better formatting
  const paragraphs = feedback.split(/\n+/);

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Overall Feedback</h2>
      <div className="text-gray-700 bg-gray-50 p-5 rounded-lg">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className={index > 0 ? "mt-4" : ""}>
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
};
