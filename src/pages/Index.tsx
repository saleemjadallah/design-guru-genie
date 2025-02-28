
import { useState, useEffect } from "react";
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

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
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'upload' | 'url' | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [pendingAnalysisData, setPendingAnalysisData] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  // Check for authenticated user
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
        
        // If user just logged in and there's a pending action, execute it
        if (event === 'SIGNED_IN' && session?.user) {
          if (pendingAction === 'upload' && pendingFile) {
            handleImageUpload(pendingFile);
            setPendingFile(null);
          } else if (pendingAction === 'url' && pendingUrl && pendingAnalysisData) {
            handleUrlAnalyze(pendingUrl, pendingAnalysisData);
            setPendingUrl(null);
            setPendingAnalysisData(null);
          }
          setPendingAction(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [pendingAction, pendingFile, pendingUrl, pendingAnalysisData]);

  const checkAuthAndProceed = (action: 'upload' | 'url', callback: () => void) => {
    if (user) {
      // User is already authenticated, proceed
      callback();
    } else {
      // User is not authenticated, show auth dialog
      setPendingAction(action);
      setIsAuthDialogOpen(true);
    }
  };

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
          // Extract just the JSON part from the text response
          const analysisText = analysisData.content[0].text;
          
          // Find where the JSON starts (looking for first '{') and ends (looking for last '}')
          const jsonStartIndex = analysisText.indexOf('{');
          const jsonEndIndex = analysisText.lastIndexOf('}') + 1;
          
          if (jsonStartIndex >= 0 && jsonEndIndex > jsonStartIndex) {
            const jsonString = analysisText.substring(jsonStartIndex, jsonEndIndex);
            const analysis = JSON.parse(jsonString);
            
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
          } else {
            throw new Error("Could not find valid JSON in the response");
          }
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

  // Wrapper functions that check auth before proceeding
  const handleImageUploadWithAuth = (file: File) => {
    setPendingFile(file);
    checkAuthAndProceed('upload', () => handleImageUpload(file));
  };

  const handleUrlAnalyzeWithAuth = (imageUrl: string, analysisData: any) => {
    setPendingUrl(imageUrl);
    setPendingAnalysisData(analysisData);
    checkAuthAndProceed('url', () => handleUrlAnalyze(imageUrl, analysisData));
  };

  const handleAuthDialogClose = () => {
    setIsAuthDialogOpen(false);
    setPendingAction(null);
    setPendingFile(null);
    setPendingUrl(null);
    setPendingAnalysisData(null);
  };

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });

    if (error) {
      console.error("Sign in error:", error);
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    }

    // Close the dialog after initiating sign in
    setIsAuthDialogOpen(false);
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
                    <ImageUpload onImageUpload={handleImageUploadWithAuth} />
                  </TabsContent>
                  <TabsContent value="url">
                    <UrlUpload onUrlAnalyze={handleUrlAnalyzeWithAuth} />
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

      {/* Authentication Dialog */}
      <AlertDialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign in required</AlertDialogTitle>
            <AlertDialogDescription>
              You need to sign in to use this feature. Would you like to sign in now?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleAuthDialogClose}>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button onClick={handleSignIn} className="bg-accent hover:bg-accent/90">
                Sign in with Google
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Index;
