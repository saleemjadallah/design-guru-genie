
import React from "react";
import { Annotation } from "./types";

interface AnnotationFallbackProps {
  image: string;
  annotations: Annotation[];
  scale: number;
  selectedIssue?: number | null;
  onIssueSelect?: (id: number | null) => void;
}

export const AnnotationFallback: React.FC<AnnotationFallbackProps> = ({
  image,
  annotations,
  scale,
  selectedIssue,
  onIssueSelect
}) => {
  return (
    <div className="relative">
      <img 
        src={image} 
        alt="Original uploaded design" 
        className="w-full h-auto rounded"
        style={{ maxHeight: "600px", objectFit: "contain" }}
      />
      {annotations.map((annotation) => (
        <div 
          key={annotation.id}
          className={`absolute w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
            annotation.priority === "high" ? "bg-red-500" : 
            annotation.priority === "medium" ? "bg-amber-500" : "bg-blue-500"
          } ${selectedIssue === annotation.id ? 'ring-2 ring-white' : ''}`}
          style={{
            left: `${annotation.x * scale}px`,
            top: `${annotation.y * scale}px`,
            transform: 'translate(-50%, -50%)',
            cursor: 'pointer'
          }}
          onClick={() => onIssueSelect?.(annotation.id)}
        >
          {annotation.id}
        </div>
      ))}
    </div>
  );
};
