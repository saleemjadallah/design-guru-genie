
import React from "react";

interface ImprovementAreaProps {
  category: string;
  before: number;
  after: number;
  improvement: number;
}

export const ImprovementCategory = ({ 
  category, 
  before, 
  after, 
  improvement 
}: ImprovementAreaProps) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex justify-between mb-2">
        <span className="font-medium">{category}</span>
        <span className="text-green-600 font-medium">+{improvement}%</span>
      </div>
      <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
        <div className="flex h-full rounded-full">
          <div 
            className="bg-blue-400 h-full" 
            style={{ width: `${before}%` }}
          ></div>
          <div 
            className="bg-green-500 h-full" 
            style={{ width: `${improvement}%` }}
          ></div>
        </div>
      </div>
      <div className="flex justify-between mt-1 text-xs text-gray-500">
        <span>Before: {before}/100</span>
        <span>After: {after}/100</span>
      </div>
    </div>
  );
};
