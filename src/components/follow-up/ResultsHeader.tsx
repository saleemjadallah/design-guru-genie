
import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Share2 } from "lucide-react";

export const ResultsHeader = () => {
  return (
    <div className="flex justify-between items-start mb-6">
      <h1 className="text-2xl font-bold">Design Analysis Results</h1>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Download className="h-4 w-4" />
          Export
        </Button>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </div>
    </div>
  );
};
