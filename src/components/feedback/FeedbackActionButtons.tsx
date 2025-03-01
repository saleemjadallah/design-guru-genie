
import React from "react";
import { Button } from "@/components/ui/button";
import { Download, LineChart, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FeedbackActionButtonsProps {
  onExportPDF: () => Promise<void>;
  onSaveAnalysis: () => Promise<void>;
  isExporting: boolean;
  isSaving: boolean;
  analysisId?: string | null;
}

export const FeedbackActionButtons = ({
  onExportPDF,
  onSaveAnalysis,
  isExporting,
  isSaving,
  analysisId
}: FeedbackActionButtonsProps) => {
  const navigate = useNavigate();

  const handleGoToFollowUp = () => {
    if (analysisId) {
      navigate(`/follow-up/${analysisId}`);
    }
  };

  return (
    <div className="flex flex-row items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1"
        onClick={onExportPDF}
        disabled={isExporting}
      >
        <Download className="w-4 h-4" />
        <span>{isExporting ? "Exporting..." : "Export PDF"}</span>
      </Button>
      
      {analysisId && (
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={handleGoToFollowUp}
        >
          <LineChart className="w-4 h-4" />
          <span>Follow-Up</span>
        </Button>
      )}
      
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1"
        onClick={onSaveAnalysis}
        disabled={isSaving}
      >
        <Save className="w-4 h-4" />
        <span>{isSaving ? "Saving..." : "Save"}</span>
      </Button>
    </div>
  );
};
