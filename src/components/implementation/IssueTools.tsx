
import React from "react";
import { Wrench, Code, PenTool, FileCode, Globe } from "lucide-react";
import { ImplementationFeedback } from "./types";

interface IssueToolsProps {
  issue: ImplementationFeedback;
}

export const IssueTools: React.FC<IssueToolsProps> = ({ issue }) => {
  const tools = issue.tools_needed || ["Code editor"];
  
  const getToolIcon = (tool: string) => {
    const toolLower = tool.toLowerCase();
    if (toolLower.includes("code") || toolLower.includes("editor")) {
      return <Code className="w-3 h-3 mr-1" />;
    } else if (toolLower.includes("design") || toolLower.includes("figma") || toolLower.includes("sketch")) {
      return <PenTool className="w-3 h-3 mr-1" />;
    } else if (toolLower.includes("browser") || toolLower.includes("web")) {
      return <Globe className="w-3 h-3 mr-1" />;
    } else if (toolLower.includes("file") || toolLower.includes("document")) {
      return <FileCode className="w-3 h-3 mr-1" />;
    } else {
      return <Wrench className="w-3 h-3 mr-1" />;
    }
  };
  
  return (
    <div className="mb-4">
      <h4 className="font-medium mb-2">Tools Needed</h4>
      <div className="flex flex-wrap gap-2">
        {tools.map((tool, index) => (
          <span key={index} className="px-2 py-1 bg-neutral-100 text-neutral-700 rounded-md text-xs flex items-center">
            {getToolIcon(tool)}
            {tool}
          </span>
        ))}
      </div>
    </div>
  );
};
