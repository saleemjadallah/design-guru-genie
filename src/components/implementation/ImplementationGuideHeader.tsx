
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import { exportResultsAsPdf } from "@/utils/pdf-export";
import { toast } from "@/hooks/use-toast";

interface ImplementationGuideHeaderProps {
  onClose: () => void;
  onExportPdf: () => void;
}

export const ImplementationGuideHeader: React.FC<ImplementationGuideHeaderProps> = ({ 
  onClose,
  onExportPdf 
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center">
        <Button 
          variant="outline" 
          size="sm" 
          className="mr-2"
          onClick={onClose}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Analysis Review
        </Button>
        <h2 className="text-xl font-bold">Implementation Guide</h2>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onExportPdf}
      >
        <Download className="w-4 h-4 mr-1" />
        Export PDF
      </Button>
    </div>
  );
};
