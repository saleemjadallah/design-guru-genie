
import { DragDropContext } from "react-beautiful-dnd";
import { ScreenshotArrangement } from "./ScreenshotArrangement";
import { ScreenshotPreview } from "./ScreenshotPreview";
import { ProcessingState } from "@/components/ProcessingState";
import { StepIndicator } from "./StepIndicator";
import { UploadZone } from "./UploadZone";
import { useMultiUpload } from "./useMultiUpload";
import { ScreenshotFile } from "./types";

interface MultiScreenshotUploadProps {
  onImageUpload: (file: File) => void;
}

export const MultiScreenshotUpload = ({ onImageUpload }: MultiScreenshotUploadProps) => {
  const {
    screenshots,
    step,
    combinedImage,
    processingStage,
    activeScreenshot,
    setActiveScreenshot,
    handleFiles,
    removeScreenshot,
    handleDragEnd,
    updateOverlap,
    handleGeneratePreview,
    handleAnalyze,
    resetToUpload,
    goToStep
  } = useMultiUpload(onImageUpload);

  return (
    <div className="w-full">
      {/* Step indicator */}
      {step !== "processing" && <StepIndicator currentStep={step} />}
      
      {/* Step content */}
      {step === "upload" && (
        <UploadZone 
          screenshots={screenshots}
          onFilesAdded={handleFiles}
          onRemoveScreenshot={removeScreenshot}
          onContinue={() => goToStep("arrange")}
        />
      )}
      
      {step === "arrange" && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <ScreenshotArrangement 
            screenshots={screenshots}
            activeScreenshot={activeScreenshot}
            setActiveScreenshot={setActiveScreenshot}
            onRemoveScreenshot={removeScreenshot}
            onUpdateOverlap={updateOverlap}
            onGeneratePreview={handleGeneratePreview}
            onReset={resetToUpload}
          />
        </DragDropContext>
      )}
      
      {step === "preview" && (
        <ScreenshotPreview 
          combinedImage={combinedImage}
          onBack={() => goToStep("arrange")}
          onAnalyze={handleAnalyze}
          onReset={resetToUpload}
        />
      )}
      
      {step === "processing" && <ProcessingState currentStage={processingStage} />}
    </div>
  );
};
