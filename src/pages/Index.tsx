
import { useState } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { UrlUpload } from "@/components/UrlUpload";
import { AnnotationExample } from "@/components/AnnotationExample";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Navigation } from "@/components/layout/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { AnalysisView } from "@/components/analysis/AnalysisView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type AnalysisStage = 0 | 1 | 2 | 3;

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

const Index = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState<AnalysisStage>(0);
  const [selectedIssue, setSelectedIssue] = useState<number | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const handleImageUpload = async (file: File) => {
    try {
      setIsAnalyzing(true);
      setAnalysisStage(0);

      const reader = new FileReader();
      reader.onload = async (e) => {
        if (e.target?.result) {
          const imageDataUrl = e.target.result as string;
          setUploadedImage(imageDataUrl);
          setAnalysisStage(1);
          
          try {
            setAnalysisStage(2);
            const { data: analysisData, error: analysisError } = await supabase.functions
              .invoke("analyze-design", {
                body: { imageUrl: imageDataUrl },
              });

            if (analysisError) throw analysisError;

            setAnalysisStage(3);
            console.log("Analysis results:", analysisData);

            if (analysisData?.result?.content) {
              try {
                const analysisText = analysisData.result.content[0].text;
                const analysis = JSON.parse(analysisText);

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
                    location: i.location,
                    id: i.id,
                    principle: i.principle,
                    technical_details: i.technical_details
                  })),
                ];

                setFeedback(newFeedback);
              } catch (parseError) {
                console.error("Error parsing analysis:", parseError);
                toast({
                  title: "Analysis error",
                  description: "Could not process the analysis results.",
                  variant: "destructive",
                });
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

  const handleUrlAnalyze = async (imageUrl: string, analysisData: any) => {
    try {
      setIsAnalyzing(true);
      setAnalysisStage(0);
      setUploadedImage(imageUrl);
      setAnalysisStage(3); // Skip the intermediate stages since we already have the analysis
      
      console.log("URL analysis results:", analysisData);
      
      if (analysisData?.content) {
        try {
          const analysisText = analysisData.content[0].text;
          const analysis = JSON.parse(analysisText);
          
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
              location: i.location,
              id: i.id,
              principle: i.principle,
              technical_details: i.technical_details
            })),
          ];
          
          setFeedback(newFeedback);
          setIsAnalyzing(false);
          
          toast({
            title: "Analysis complete",
            description: "The website design has been analyzed successfully",
          });
        } catch (parseError) {
          console.error("Error parsing URL analysis:", parseError);
          toast({
            title: "Analysis error",
            description: "Could not process the analysis results.",
            variant: "destructive",
          });
          setIsAnalyzing(false);
        }
      } else {
        throw new Error("Invalid analysis data format");
      }
    } catch (error) {
      console.error("URL analysis error:", error);
      toast({
        title: "Analysis failed",
        description: "There was an error analyzing the website design. Please try again.",
        variant: "destructive",
      });
      setIsAnalyzing(false);
    }
  };

  const filteredIssues = priorityFilter === 'all' 
    ? feedback.filter(f => f.type === "improvement")
    : feedback.filter(f => f.type === "improvement" && f.priority === priorityFilter);

  const positiveFeatures = feedback.filter(f => f.type === "positive");

  const getIssueCountByPriority = (priority: string) => {
    return feedback.filter(f => f.type === "improvement" && f.priority === priority).length;
  };

  const handleBack = () => {
    setUploadedImage(null);
    setFeedback([]);
    setIsAnalyzing(false);
    setAnalysisStage(0);
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 pt-16">
        {!uploadedImage ? (
          <div className="container py-12">
            <div className="max-w-4xl mx-auto">
              <Hero />
              <div className="animate-slide-up space-y-6">
                <Tabs defaultValue="upload" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="upload">Upload Image</TabsTrigger>
                    <TabsTrigger value="url">Analyze URL</TabsTrigger>
                  </TabsList>
                  <TabsContent value="upload">
                    <ImageUpload onImageUpload={handleImageUpload} />
                  </TabsContent>
                  <TabsContent value="url">
                    <UrlUpload onUrlAnalyze={handleUrlAnalyze} />
                  </TabsContent>
                </Tabs>
                <div className="text-center">
                  <p className="text-sm text-neutral-600">
                    First analysis free • $18/month after • Cancel anytime
                  </p>
                </div>
                <HowItWorks />
                <AnnotationExample />
              </div>
            </div>
          </div>
        ) : (
          <AnalysisView
            isAnalyzing={isAnalyzing}
            analysisStage={analysisStage}
            uploadedImage={uploadedImage}
            feedback={feedback}
            selectedIssue={selectedIssue}
            priorityFilter={priorityFilter}
            positiveFeatures={positiveFeatures}
            filteredIssues={filteredIssues}
            onBack={handleBack}
            setPriorityFilter={setPriorityFilter}
            setSelectedIssue={setSelectedIssue}
            setFeedback={setFeedback}
            getIssueCountByPriority={getIssueCountByPriority}
          />
        )}
      </div>
    </>
  );
};

export default Index;
