
import React from "react";

interface DesignIssueProps {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
}

export const DesignIssue = ({ 
  title, 
  description, 
  priority 
}: DesignIssueProps) => {
  const getBgColor = () => {
    switch (priority) {
      case "high":
        return "bg-red-50 border-red-100";
      case "medium":
        return "bg-orange-50 border-orange-100";
      case "low":
        return "bg-green-50 border-green-100";
    }
  };

  const getTextColor = () => {
    switch (priority) {
      case "high":
        return "text-red-800";
      case "medium":
        return "text-orange-800";
      case "low":
        return "text-green-800";
    }
  };

  const bgColor = getBgColor();
  const textColor = getTextColor();

  return (
    <div className={`${bgColor} p-4 rounded-lg border`}>
      <h4 className={`font-medium ${textColor}`}>{title}</h4>
      <p className={`text-sm ${textColor} mt-1 opacity-90`}>{description}</p>
    </div>
  );
};
