
import { useState } from "react";
import { GeometricAccents } from "@/components/patterns/GeometricAccents";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { FeedbackPanel } from "@/components/FeedbackPanel";
import { ImageUpload } from "@/components/ImageUpload";
import { MultiScreenshotUpload } from "@/components/multi-upload/MultiScreenshotUpload";
import { ProcessingState } from "@/components/ProcessingState";
import { UrlUpload } from "@/components/UrlUpload";
import { SeeItInAction } from "@/components/landing/SeeItInAction";
import { Image, Images, Link } from "lucide-react";

export const Index = () => {
  const [uploadType, setUploadType] = useState<"image" | "url" | "multi" | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [feedback, setFeedback] = useState([]);
  const [analysisData, setAnalysisData] = useState(null);

  const handleImageUpload = (file: File) => {
    console.log("Handling image upload:", file.name);
    setIsUploading(true);
    simulateProcessing();
  };

  const handleUrlUpload = (imageUrl: string, data: any) => {
    console.log("Handling URL upload:", imageUrl);
    setAnalysisData(data);
    setIsUploading(true);
    simulateProcessing();
  };

  const simulateProcessing = () => {
    setCurrentStage(0);
    const timer1 = setTimeout(() => setCurrentStage(1), 1500);
    const timer2 = setTimeout(() => setCurrentStage(2), 3000);
    const timer3 = setTimeout(() => {
      setCurrentStage(3);
      setTimeout(() => {
        setIsUploading(false);
        setShowFeedback(true);
      }, 1000);
    }, 4500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  };

  const handleReset = () => {
    setUploadType(null);
    setIsUploading(false);
    setShowFeedback(false);
  };

  return (
    <div className="min-h-screen">
      <GeometricAccents />

      <div className="max-w-screen-xl mx-auto px-4 py-12 sm:px-6 lg:py-16">
        <Hero />

        <div className="mt-16">
          <div className="bg-white shadow-xl rounded-xl overflow-hidden">
            <Sheet open={showFeedback} onOpenChange={setShowFeedback}>
              <SheetContent
                side="right"
                className="w-full sm:max-w-md md:max-w-lg lg:max-w-xl p-0"
              >
                <FeedbackPanel 
                  feedback={feedback}
                  selectedIssue={null}
                  setFeedback={setFeedback}
                />
              </SheetContent>

              <div className="p-8">
                <h2 className="text-2xl font-bold text-center mb-8">
                  Upload Your Design
                </h2>

                {!uploadType && !isUploading && (
                  <div className="space-y-4">
                    <p className="text-center text-gray-600 mb-8">
                      Choose how you'd like to upload your design for analysis:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button
                        onClick={() => setUploadType("image")}
                        className="h-auto p-6 flex flex-col items-center gap-3 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200"
                        variant="outline"
                      >
                        <Image
                          className="w-20 h-20 mb-2 text-purple-500 feature-icon"
                          aria-label="Upload image icon"
                        />
                        <span className="text-lg font-medium">Upload Image</span>
                        <span className="text-sm text-gray-500">
                          Upload a screenshot or design file
                        </span>
                      </Button>

                      <Button
                        onClick={() => setUploadType("multi")}
                        className="h-auto p-6 flex flex-col items-center gap-3 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200"
                        variant="outline"
                      >
                        <Images
                          className="w-20 h-20 mb-2 text-blue-500 feature-icon"
                          aria-label="Multiple screenshots icon"
                        />
                        <span className="text-lg font-medium">Multiple Screenshots</span>
                        <span className="text-sm text-gray-500">
                          Combine multiple screenshots into one
                        </span>
                      </Button>

                      <Button
                        onClick={() => setUploadType("url")}
                        className="h-auto p-6 flex flex-col items-center gap-3 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200"
                        variant="outline"
                      >
                        <Link
                          className="w-20 h-20 mb-2 text-green-500 feature-icon"
                          aria-label="Enter URL icon"
                        />
                        <span className="text-lg font-medium">Enter URL</span>
                        <span className="text-sm text-gray-500">
                          Analyze a live website
                        </span>
                      </Button>
                    </div>
                  </div>
                )}

                {uploadType === "image" && !isUploading && (
                  <div>
                    <Button
                      variant="outline"
                      className="mb-6"
                      onClick={() => setUploadType(null)}
                    >
                      ← Back to options
                    </Button>
                    <ImageUpload onImageUpload={handleImageUpload} />
                  </div>
                )}

                {uploadType === "multi" && !isUploading && (
                  <div>
                    <Button
                      variant="outline"
                      className="mb-6"
                      onClick={() => setUploadType(null)}
                    >
                      ← Back to options
                    </Button>
                    <MultiScreenshotUpload onImageUpload={handleImageUpload} />
                  </div>
                )}

                {uploadType === "url" && !isUploading && (
                  <div>
                    <Button
                      variant="outline"
                      className="mb-6"
                      onClick={() => setUploadType(null)}
                    >
                      ← Back to options
                    </Button>
                    <UrlUpload onUrlAnalyze={handleUrlUpload} />
                  </div>
                )}

                {isUploading && (
                  <ProcessingState currentStage={currentStage} />
                )}
              </div>
            </Sheet>
          </div>
        </div>

        <HowItWorks />
        
        <SeeItInAction />
      </div>
    </div>
  );
};

export default Index;
