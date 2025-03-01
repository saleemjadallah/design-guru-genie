
import React from "react";
import { ThumbsUp } from "lucide-react";

interface DesignStrengthProps {
  title: string;
  description: string;
}

export const DesignStrength = ({ 
  title, 
  description 
}: DesignStrengthProps) => {
  return (
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
      <div className="flex items-start">
        <ThumbsUp className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
        <div>
          <h4 className="font-medium text-blue-800">{title}</h4>
          <p className="text-sm text-blue-700 mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
};
