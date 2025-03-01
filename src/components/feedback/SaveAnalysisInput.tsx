
import React, { useRef } from "react";

interface SaveAnalysisInputProps {
  savedTitle: string;
  setSavedTitle: (title: string) => void;
  titleInputRef: React.RefObject<HTMLInputElement>;
}

export const SaveAnalysisInput = ({
  savedTitle,
  setSavedTitle,
  titleInputRef
}: SaveAnalysisInputProps) => {
  return (
    <div className="mb-4">
      <input
        ref={titleInputRef}
        type="text"
        value={savedTitle}
        onChange={(e) => setSavedTitle(e.target.value)}
        placeholder="Enter a title to save this analysis"
        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
      />
    </div>
  );
};
