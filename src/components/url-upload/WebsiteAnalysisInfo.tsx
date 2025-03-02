
import React from "react";

export const WebsiteAnalysisInfo: React.FC = () => {
  return (
    <div className="mt-6 text-center text-sm text-neutral-500 bg-gray-50 p-4 rounded-lg w-full max-w-md">
      <h4 className="font-medium text-gray-700 mb-2">What we analyze:</h4>
      <ul className="text-left space-y-1">
        <li>• Visual hierarchy and layout design</li>
        <li>• Color scheme and contrast ratios</li>
        <li>• Typography and readability</li>
        <li>• UI component consistency</li>
        <li>• Accessibility considerations</li>
      </ul>
    </div>
  );
};

export const ProcessingNotice: React.FC = () => {
  return (
    <div className="mt-4 text-center text-sm text-amber-700 bg-amber-50 p-3 rounded-lg w-full max-w-md">
      <p>Analysis may take up to 30 seconds for complex websites.</p>
    </div>
  );
};
