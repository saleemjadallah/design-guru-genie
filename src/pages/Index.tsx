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
import { ArrowLeft, Download, Share2, Check, AlertCircle } from "lucide-react";

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

  const filteredIssues = priorityFilter === 'all' 
    ? feedback.filter(f => f.type === "improvement")
    : feedback.filter(f => f.type === "improvement" && f.priority === priorityFilter);

  const positiveFeatures = feedback.filter(f => f.type === "positive");

  const getIssueCountByPriority = (priority: string) => {
    return feedback.filter(f => f.type === "improvement" && f.priority === priority).length;
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100">
        {!uploadedImage ? (
          <div className="container py-12">
            <div className="max-w-4xl mx-auto">
              <Hero />
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
            </div>
          </div>
        ) : (
          <div className="min-h-screen bg-neutral-50">
            <header className="bg-white shadow-sm">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                <div className="flex items-center">
                  <button 
                    className="mr-4 text-neutral-600 hover:text-neutral-900"
                    onClick={() => {
                      setUploadedImage(null);
                      setFeedback([]);
                      setIsAnalyzing(false);
                      setAnalysisStage(0);
                    }}
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <h1 className="text-xl font-bold text-neutral-900">Design Analysis</h1>
                </div>
              </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {isAnalyzing ? (
                <ProcessingState currentStage={analysisStage} />
              ) : (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-neutral-900 mb-4">Design Analysis</h2>
                      <p className="text-neutral-700">
                        This e-commerce product page has a clean overall structure, but suffers from several usability and accessibility issues that may impact conversion rates and user experience.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-6">
                      <div className="flex-1 border border-green-100 bg-green-50 rounded-lg p-4">
                        <h3 className="font-medium text-green-800 flex items-center gap-2 mb-3">
                          <Check size={16} className="text-green-600" />
                          Design Strengths
                        </h3>
                        <ul className="space-y-4">
                          {positiveFeatures.map((strength, index) => (
                            <li key={index}>
                              <h4 className="font-medium text-neutral-900">{strength.title}</h4>
                              <p className="text-sm text-neutral-600">{strength.description}</p>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex-1 border border-neutral-200 rounded-lg p-4">
                        <h3 className="font-medium text-neutral-800 flex items-center gap-2 mb-3">
                          <AlertCircle size={16} />
                          Issues Breakdown
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm flex items-center gap-2">
                              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                              High Priority
                            </span>
                            <span className="text-sm font-medium">
                              {getIssueCountByPriority('high')}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm flex items-center gap-2">
                              <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                              Medium Priority
                            </span>
                            <span className="text-sm font-medium">
                              {getIssueCountByPriority('medium')}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm flex items-center gap-2">
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                              Low Priority
                            </span>
                            <span className="text-sm font-medium">
                              {getIssueCountByPriority('low')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-between items-center gap-4">
                    <div className="flex items-center">
                      <span className="text-sm text-neutral-700 mr-2">Filter by:</span>
                      <div className="inline-flex rounded-md shadow-sm" role="group">
                        <button
                          type="button"
                          className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                            priorityFilter === 'all'
                              ? 'bg-indigo-600 text-white'
                              : 'bg-white text-neutral-700 hover:bg-neutral-50'
                          } border border-neutral-300`}
                          onClick={() => setPriorityFilter('all')}
                        >
                          All
                        </button>
                        <button
                          type="button"
                          className={`px-4 py-2 text-sm font-medium ${
                            priorityFilter === 'high'
                              ? 'bg-red-500 text-white'
                              : 'bg-white text-neutral-700 hover:bg-neutral-50'
                          } border-t border-b border-r border-neutral-300`}
                          onClick={() => setPriorityFilter('high')}
                        >
                          High
                        </button>
                        <button
                          type="button"
                          className={`px-4 py-2 text-sm font-medium ${
                            priorityFilter === 'medium'
                              ? 'bg-amber-500 text-white'
                              : 'bg-white text-neutral-700 hover:bg-neutral-50'
                          } border-t border-b border-r border-neutral-300`}
                          onClick={() => setPriorityFilter('medium')}
                        >
                          Medium
                        </button>
                        <button
                          type="button"
                          className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                            priorityFilter === 'low'
                              ? 'bg-blue-500 text-white'
                              : 'bg-white text-neutral-700 hover:bg-neutral-50'
                          } border-t border-b border-r border-neutral-300`}
                          onClick={() => setPriorityFilter('low')}
                        >
                          Low
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button className="flex items-center px-4 py-2 bg-white border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 hover:bg-neutral-50">
                        <Download size={16} className="mr-2" />
                        Export PDF
                      </button>
                      <button className="flex items-center px-4 py-2 bg-white border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 hover:bg-neutral-50">
                        <Share2 size={16} className="mr-2" />
                        Share
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="lg:w-3/5">
                      <div className="bg-white rounded-lg shadow-sm p-4">
                        <div className="text-center text-sm font-medium text-neutral-500 mb-4">
                          With AI Annotations
                        </div>
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
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Index;
