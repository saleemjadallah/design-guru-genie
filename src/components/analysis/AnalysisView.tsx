
import { ArrowLeft } from "lucide-react";
import { Overview } from "./Overview";
import { FilterControls } from "./FilterControls";
import { AnnotationCanvas } from "@/components/AnnotationCanvas";
import { FeedbackPanel } from "@/components/FeedbackPanel";
import { ProcessingState } from "@/components/ProcessingState";
import { useEffect, useState } from "react";

type Feedback = {
  type: "positive" | "improvement";
  title: string;
  description: string;
  priority?: "low" | "medium" | "high";
  location?: { x: number; y: number };
  id?: number;
  principle?: string;
  technical_details?: string;
};

type Props = {
  isAnalyzing: boolean;
  analysisStage: number;
  uploadedImage: string | null;
  feedback: Feedback[];
  selectedIssue: number | null;
  priorityFilter: 'all' | 'high' | 'medium' | 'low';
  positiveFeatures: Feedback[];
  filteredIssues: Feedback[];
  onBack: () => void;
  setPriorityFilter: (filter: 'all' | 'high' | 'medium' | 'low') => void;
  setSelectedIssue: (id: number | null) => void;
  setFeedback: (feedback: Feedback[]) => void;
  getIssueCountByPriority: (priority: string) => number;
};

export const AnalysisView = ({
  isAnalyzing,
  analysisStage,
  uploadedImage,
  feedback,
  selectedIssue,
  priorityFilter,
  positiveFeatures,
  filteredIssues,
  onBack,
  setPriorityFilter,
  setSelectedIssue,
  setFeedback,
  getIssueCountByPriority,
}: Props) => {
  // Track image loaded status
  const [imageReady, setImageReady] = useState(false);
  
  // Check if this is a URL analysis (no real image, just a placeholder)
  const isUrlAnalysis = uploadedImage?.startsWith('data:image/svg+xml');
  
  useEffect(() => {
    if (uploadedImage && !isUrlAnalysis) {
      // Create a new Image to preload the image
      const img = new Image();
      img.onload = () => {
        setImageReady(true);
      };
      img.onerror = () => {
        console.error("Failed to load image");
        // Still set to ready so we can display error fallback
        setImageReady(true);
      };
      img.src = uploadedImage;
    } else {
      // For URL analysis or if no image, we're ready
      setImageReady(true);
    }
  }, [uploadedImage, isUrlAnalysis]);

  return (
    <div className="min-h-screen bg-neutral-50 pt-16">
      <header className="fixed top-16 left-0 right-0 bg-white shadow-sm z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <button 
              className="mr-4 text-neutral-600 hover:text-neutral-900"
              onClick={onBack}
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-neutral-900">
              {isUrlAnalysis ? "Website Analysis" : "Design Analysis"}
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
        {isAnalyzing ? (
          <ProcessingState currentStage={analysisStage} />
        ) : (
          <div className="space-y-6">
            <Overview 
              positiveFeatures={positiveFeatures}
              getIssueCountByPriority={getIssueCountByPriority}
              isUrlAnalysis={isUrlAnalysis}
            />

            <FilterControls 
              priorityFilter={priorityFilter}
              setPriorityFilter={setPriorityFilter}
              uploadedImage={uploadedImage}
              feedback={feedback}
              isUrlAnalysis={isUrlAnalysis}
            />

            {isUrlAnalysis ? (
              // URL Analysis Layout - Full-width feedback panel
              <div className="bg-white rounded-lg shadow-sm">
                <FeedbackPanel 
                  feedback={filteredIssues} 
                  strengths={positiveFeatures}
                  onSave={setFeedback}
                  selectedIssue={selectedIssue}
                  onIssueSelect={setSelectedIssue}
                  isUrlAnalysis={true}
                />
              </div>
            ) : (
              // Image Analysis Layout - Split view with annotations
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="lg:w-3/5">
                  <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="text-center text-sm font-medium text-neutral-500 mb-4">
                      With AI Annotations
                    </div>
                    {uploadedImage && imageReady && (
                      <AnnotationCanvas
                        image={uploadedImage}
                        onSave={() => {}}
                        annotations={filteredIssues
                          .filter(f => f.location)
                          .map(f => ({
                            id: f.id || 0,
                            x: f.location?.x || 0,
                            y: f.location?.y || 0,
                            priority: f.priority || "medium"
                          }))}
                        selectedIssue={selectedIssue}
                        onIssueSelect={setSelectedIssue}
                      />
                    )}
                    
                    {uploadedImage && !imageReady && (
                      <div className="w-full py-20 flex items-center justify-center bg-neutral-50 rounded-lg">
                        <div className="animate-pulse text-neutral-500">
                          Preparing image...
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="lg:w-2/5">
                  <FeedbackPanel 
                    feedback={filteredIssues} 
                    strengths={positiveFeatures}
                    onSave={setFeedback}
                    selectedIssue={selectedIssue}
                    onIssueSelect={setSelectedIssue}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
