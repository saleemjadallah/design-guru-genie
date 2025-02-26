
import { useState } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { AnnotationCanvas } from "@/components/AnnotationCanvas";
import { FeedbackPanel } from "@/components/FeedbackPanel";
import { AnnotationExample } from "@/components/AnnotationExample";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Navigation } from "@/components/layout/Navigation";
import { ProcessingState } from "@/components/ProcessingState";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type AnalysisStage = 0 | 1 | 2 | 3;

type Feedback = {
  type: "positive" | "improvement";
  title: string;
  description: string;
  priority?: "low" | "medium" | "high";
};

const Index = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState<AnalysisStage>(0);

  const handleImageUpload = async (file: File) => {
    try {
      setIsAnalyzing(true);
      setAnalysisStage(0);

      // Convert file to data URL for preview
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (e.target?.result) {
          setUploadedImage(e.target.result as string);
          
          try {
            // Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from("designs")
              .upload(`design-${Date.now()}.png`, file);

            if (uploadError) throw uploadError;

            // Get public URL for analysis
            setAnalysisStage(1);
            const { data: { publicUrl } } = supabase.storage
              .from("designs")
              .getPublicUrl(uploadData.path);

            // Call analysis function
            setAnalysisStage(2);
            const { data: analysisData, error: analysisError } = await supabase.functions
              .invoke("analyze-design", {
                body: { imageUrl: publicUrl },
              });

            if (analysisError) throw analysisError;

            // Process results
            setAnalysisStage(3);
            console.log("Analysis results:", analysisData);

            // Convert analysis results to feedback format
            if (analysisData?.result?.content) {
              try {
                const analysis = JSON.parse(analysisData.result.content);
                const newFeedback: Feedback[] = [
                  ...analysis.strengths.map((s: any) => ({
                    type: "positive",
                    title: s.title,
                    description: s.description,
                  })),
                  ...analysis.issues.map((i: any) => ({
                    type: "improvement",
                    title: i.issue,
                    description: i.recommendation,
                    priority: i.priority,
                  })),
                ];
                setFeedback(newFeedback);
              } catch (parseError) {
                console.error("Error parsing analysis:", parseError);
              }
            }

            setIsAnalyzing(false);
            toast({
              title: "Analysis complete",
              description: "Your design has been analyzed successfully",
            });
          } catch (error) {
            console.error("Analysis error:", error);
            toast({
              title: "Analysis failed",
              description: "There was an error analyzing your design. Please try again.",
              variant: "destructive",
            });
            setIsAnalyzing(false);
          }
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your image. Please try again.",
        variant: "destructive",
      });
      setIsAnalyzing(false);
    }
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 pt-16">
        <div className="container py-12">
          <div className="max-w-4xl mx-auto">
            <Hero />
            
            {!uploadedImage ? (
              <div className="animate-slide-up space-y-6">
                <ImageUpload onImageUpload={handleImageUpload} />
                <div className="text-center">
                  <p className="text-sm text-neutral-600">
                    First analysis free • $18/month after • Cancel anytime
                  </p>
                </div>

                <HowItWorks />
                <AnnotationExample />
              </div>
            ) : (
              <div className="space-y-8 animate-fade-in">
                {isAnalyzing ? (
                  <ProcessingState currentStage={analysisStage} />
                ) : (
                  <>
                    <AnnotationCanvas
                      image={uploadedImage}
                      onSave={() => {}}
                    />
                    <FeedbackPanel feedback={feedback} onSave={setFeedback} />
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;
