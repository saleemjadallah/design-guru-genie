
import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Share2 } from "lucide-react";
import { exportResultsAsPdf } from "@/utils/pdf-export";
import { toast } from "@/hooks/use-toast";

export const ResultsHeader = () => {
  const handleExport = async () => {
    await exportResultsAsPdf('results-content', 'design-analysis-report.pdf');
  };

  const handleShare = () => {
    // This functionality could be implemented later
    toast({
      title: "Share feature",
      description: "Sharing functionality will be available soon.",
    });
  };

  return (
    <div className="flex justify-between items-start mb-6">
      <h1 className="text-2xl font-bold">Design Analysis Results</h1>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={handleExport}
        >
          <Download className="h-4 w-4" />
          Export PDF
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={handleShare}
        >
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </div>
    </div>
  );
};
