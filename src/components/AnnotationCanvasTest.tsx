
import { useState } from "react";
import { AnnotationCanvas } from "./AnnotationCanvas";

export const AnnotationCanvasTest = () => {
  const [selectedIssue, setSelectedIssue] = useState<number | null>(null);
  
  // Test image URL - replace with your own image URL for testing
  const testImageUrl = "https://placehold.co/800x600";
  
  // Sample annotations
  const annotations = [
    { id: 1, x: 150, y: 150, priority: "high" as const },
    { id: 2, x: 300, y: 200, priority: "medium" as const },
    { id: 3, x: 400, y: 300, priority: "low" as const },
    { id: 4, x: 600, y: 400, priority: "high" as const },
    { id: 5, x: 200, y: 400, priority: "medium" as const },
  ];
  
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Annotation Canvas Test</h2>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Selected Issue: {selectedIssue ? selectedIssue : "None"}</p>
        <div className="flex gap-2">
          {annotations.map(annotation => (
            <button
              key={annotation.id}
              className={`px-3 py-1 rounded-full text-white ${
                selectedIssue === annotation.id ? 'ring-2 ring-black' : ''
              } ${
                annotation.priority === "high" ? "bg-red-500" : 
                annotation.priority === "medium" ? "bg-amber-500" : "bg-blue-500"
              }`}
              onClick={() => setSelectedIssue(annotation.id)}
            >
              Issue {annotation.id}
            </button>
          ))}
          <button
            className="px-3 py-1 rounded-full bg-gray-200"
            onClick={() => setSelectedIssue(null)}
          >
            Clear
          </button>
        </div>
      </div>
      
      <div className="border border-gray-200 rounded-lg">
        <AnnotationCanvas
          image={testImageUrl}
          annotations={annotations}
          selectedIssue={selectedIssue}
          onIssueSelect={setSelectedIssue}
          onSave={() => {}}
        />
      </div>
      
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium mb-2">Debugging Information:</h3>
        <pre className="text-xs overflow-auto p-2 bg-gray-100 rounded">
          {JSON.stringify({ annotations, selectedIssue }, null, 2)}
        </pre>
      </div>
    </div>
  );
};
