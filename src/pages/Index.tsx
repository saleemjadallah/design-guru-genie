
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
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
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

              <div className="p-8 relative overflow-hidden">
                {/* Background gradient effect similar to How It Works section */}
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl opacity-50"></div>
                
                <div className="relative">
                  <h2 className="text-3xl font-bold text-center mb-2 text-neutral-900">
                    Upload Your Design
                  </h2>
                  <p className="text-center text-accent font-medium mb-8">
                    Free first analysis / $18 after / cancel anytime
                  </p>

                  {!uploadType && !isUploading && (
                    <div className="space-y-6">
                      <p className="text-center text-gray-600 mb-8">
                        Choose how you'd like to upload your design for analysis:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Button
                          onClick={() => setUploadType("image")}
                          className="h-auto p-8 flex flex-col items-center gap-4 border-0 shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-[1.03]"
                          style={{
                            background: "linear-gradient(135deg, #4F46E5 0%, #818CF8 100%)",
                          }}
                        >
                          <div className="w-20 h-20 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center mb-2">
                            <Image
                              className="w-12 h-12 text-white"
                              aria-label="Upload image icon"
                            />
                          </div>
                          <span className="text-xl font-bold text-white">Upload Image</span>
                          <span className="text-sm text-white/90">
                            Upload a screenshot or design file
                          </span>
                        </Button>

                        <Button
                          onClick={() => setUploadType("multi")}
                          className="h-auto p-8 flex flex-col items-center gap-4 border-0 shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-[1.03]"
                          style={{
                            background: "linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)",
                          }}
                        >
                          <div className="w-20 h-20 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center mb-2">
                            <Images
                              className="w-12 h-12 text-white"
                              aria-label="Multiple screenshots icon"
                            />
                          </div>
                          <span className="text-xl font-bold text-white">Multiple Screenshots</span>
                          <span className="text-sm text-white/90">
                            Combine multiple screenshots into one
                          </span>
                        </Button>

                        <Button
                          onClick={() => setUploadType("url")}
                          className="h-auto p-8 flex flex-col items-center gap-4 border-0 shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-[1.03]"
                          style={{
                            background: "linear-gradient(135deg, #0D9488 0%, #5EEAD4 100%)",
                          }}
                        >
                          <div className="w-20 h-20 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center mb-2">
                            <Link
                              className="w-12 h-12 text-white"
                              aria-label="Enter URL icon"
                            />
                          </div>
                          <span className="text-xl font-bold text-white">Enter URL</span>
                          <span className="text-sm text-white/90">
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
