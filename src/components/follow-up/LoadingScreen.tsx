
import React from "react";

interface LoadingScreenProps {
  message?: string;
  subMessage?: string;
}

export const LoadingScreen = ({
  message = "Loading your results...",
  subMessage = "Preparing your detailed analysis report"
}: LoadingScreenProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-12 mb-8 text-center">
      <div className="w-16 h-16 border-4 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-6"></div>
      <h2 className="text-xl font-semibold text-gray-700">{message}</h2>
      <p className="text-gray-500 mt-2">{subMessage}</p>
    </div>
  );
};
