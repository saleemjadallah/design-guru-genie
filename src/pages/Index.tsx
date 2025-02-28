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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const [email, setEmail] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isUserSubscribed = user?.user_metadata?.is_subscribed === true;

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
        
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

  const handleImageUploadWithAuth = (file: File) => {
    console.log("handleImageUploadWithAuth called with file:", file.name);
    handleImageUpload(file);
  };

  const handleImageUpload = async (file: File) => {
    console.log("Starting image upload and analysis for file:", file.name);
    try {
      setIsAnalyzing(true);
      setAnalysisStage(0);

      const reader = new FileReader();
      reader.onload = async (e) => {
        if (e.target?.result) {
          console.log("File read successfully, setting uploaded image");
          const imageDataUrl = e.target.result as string;
          setUploadedImage(imageDataUrl);
          setAnalysisStage(1);
          
          try {
            console.log("Moving to analysis stage 2");
            setAnalysisStage(2);
            
            setTimeout(() => {
              console.log("Simulating analysis completion");
              setAnalysisStage(3);
              
              const mockAnalysis = {
                strengths: [
                  {
                    type: "positive" as const,
                    title: "Strong Color Contrast",
                    description: "The design uses high contrast colors that enhance readability and visual appeal."
                  },
                  {
                    type: "positive" as const,
                    title: "Clear Typography Hierarchy",
                    description: "Good use of font sizes and weights creates a clear visual hierarchy."
                  },
                  {
                    type: "positive" as const,
                    title: "Consistent Visual Style",
                    description: "The design maintains a consistent visual language throughout the interface."
                  }
                ],
                issues: [
                  {
                    type: "improvement" as const,
                    title: "Cluttered Layout",
                    description: "The elements are too tightly packed, making the interface feel cluttered. Consider adding more whitespace.",
                    priority: "high" as const,
                    location: { x: 200, y: 150 },
                    id: 1,
                    principle: "Visual Clarity",
                    technical_details: "Increase padding between elements by at least 16px."
                  },
                  {
                    type: "improvement" as const,
                    title: "Inconsistent Button Styles",
                    description: "Button styles vary throughout the interface. Standardize button appearance for better usability.",
                    priority: "medium" as const,
                    location: { x: 400, y: 300 },
                    id: 2,
                    principle: "Consistency",
                    technical_details: "Define a single button component with variants for different states."
                  },
                  {
                    type: "improvement" as const,
                    title: "Low Text Contrast",
                    description: "Some text has low contrast with the background, making it difficult to read.",
                    priority: "high" as const,
                    location: { x: 150, y: 400 },
                    id: 3,
                    principle: "Accessibility",
                    technical_details: "Ensure text meets WCAG AA standards with a minimum contrast ratio of 4.5:1."
                  },
                  {
                    type: "improvement" as const,
                    title: "Overwhelming Color Palette",
                    description: "Too many colors are used, creating visual confusion. Limit the color palette.",
                    priority: "medium" as const,
                    location: { x: 300, y: 200 },
                    id: 4,
                    principle: "Visual Harmony",
                    technical_details: "Reduce the palette to 3 primary colors and 2-3 accent colors."
                  },
                  {
                    type: "improvement" as const,
                    title: "Mobile Responsiveness Issues",
                    description: "The design doesn't scale well to smaller screens. Implement a responsive layout.",
                    priority: "high" as const,
                    location: { x: 250, y: 350 },
                    id: 5,
                    principle: "Responsive Design",
                    technical_details: "Use flexible grids and media queries to adapt the layout."
                  },
                  {
                    type: "improvement" as const,
                    title: "Missing Visual Feedback",
                    description: "Interactive elements lack visual feedback for hover and active states.",
                    priority: "low" as const,
                    location: { x: 350, y: 250 },
                    id: 6,
                    principle: "User Feedback",
                    technical_details: "Add hover and active states to all interactive elements."
                  },
                  {
                    type: "improvement" as const,
                    title: "Form Field Alignment",
                    description: "Form fields are not properly aligned, creating a disorganized appearance.",
                    priority: "low" as const,
                    location: { x: 450, y: 400 },
                    id: 7,
                    principle: "Alignment",
                    technical_details: "Use a grid system to align form fields consistently."
                  }
                ]
              };

              const newFeedback: Feedback[] = [
                ...mockAnalysis.strengths,
                ...mockAnalysis.issues
              ];
              
              setFeedback(newFeedback);
              setIsAnalyzing(false);
              
              toast({
                title: "Analysis complete",
                description: "Your design has been analyzed successfully",
              });
            }, 3000);
            
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

  const handleUrlAnalyzeWithAuth = (imageUrl: string, analysisData: any) => {
    setPendingUrl(imageUrl);
    setPendingAnalysisData(analysisData);
    handleUrlAnalyze(imageUrl, analysisData);
  };

  const handleUrlAnalyze = async (imageUrl: string, analysisData: any) => {
    try {
      setIsAnalyzing(true);
      setAnalysisStage(0);
      setUploadedImage(imageUrl);
      setAnalysisStage(3);

      console.log("URL analysis results:", analysisData);
      
      if (analysisData?.content) {
        try {
          const analysisText = analysisData.content[0].text;
          
          const jsonStartIndex = analysisText.indexOf('{');
          const jsonEndIndex = analysisText.lastIndexOf('}') + 1;
          
          if (jsonStartIndex >= 0 && jsonEndIndex > jsonStartIndex) {
            const jsonString = analysisText.substring(jsonStartIndex, jsonEndIndex);
            const analysis = JSON.parse(jsonString);
            
            const newFeedback: Feedback[] = [
              ...(analysis.strengths || []).map((s: any) => ({
                type: "positive" as const,
                title: s.title,
                description: s.description,
              })),
              ...(analysis.issues || []).map((i: any) => {
                let priority: "low" | "medium" | "high" | undefined = undefined;
                if (i.priority === "low" || i.priority === "medium" || i.priority === "high") {
                  priority = i.priority as "low" | "medium" | "high";
                }
                
                return {
                  type: "improvement" as const,
                  title: i.issue,
                  description: i.recommendation,
                  priority: priority,
                  location: i.location,
                  id: i.id,
                  principle: i.principle,
                  technical_details: i.technical_details
                };
              }),
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

  const handleAuthDialogClose = () => {
    setIsAuthDialogOpen(false);
    setPendingAction(null);
    setPendingFile(null);
    setPendingUrl(null);
    setPendingAnalysisData(null);
    setIsEmailSent(false);
    setEmail("");
  };

  const handleSignIn = async () => {
    toast({
      title: "Test Mode: Sign In",
      description: "Authentication bypassed for testing",
    });
    
    setUser({
      id: "test-user-id",
      email: "test@example.com"
    });

    setIsAuthDialogOpen(false);
    
    if (pendingAction === 'upload' && pendingFile) {
      handleImageUpload(pendingFile);
      setPendingFile(null);
    } else if (pendingAction === 'url' && pendingUrl && pendingAnalysisData) {
      handleUrlAnalyze(pendingUrl, pendingAnalysisData);
      setPendingUrl(null);
      setPendingAnalysisData(null);
    }
    setPendingAction(null);
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      setTimeout(() => {
        setIsEmailSent(true);
        toast({
          title: "Test Mode: Magic link",
          description: "Email verification bypassed for testing",
        });
        
        setUser({
          id: "test-user-id",
          email: email
        });
        
        setIsAuthDialogOpen(false);
        
        if (pendingAction === 'upload' && pendingFile) {
          handleImageUpload(pendingFile);
          setPendingFile(null);
        } else if (pendingAction === 'url' && pendingUrl && pendingAnalysisData) {
          handleUrlAnalyze(pendingUrl, pendingAnalysisData);
          setPendingUrl(null);
          setPendingAnalysisData(null);
        }
        setPendingAction(null);
      }, 1000);
    } catch (error: any) {
      console.error("Email sign in error:", error);
      toast({
        title: "Sign in failed",
        description: error.message || "Could not send magic link.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
            isSubscribed={isUserSubscribed}
          />
        )}
      </div>

      <AlertDialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign in required</AlertDialogTitle>
            <AlertDialogDescription>
              You need to sign in to use this feature.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {!isEmailSent ? (
            <div className="grid gap-4 py-4">
              <form onSubmit={handleEmailSignIn} className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending link..." : "Sign in with Email"}
                </Button>
              </form>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              
              <Button 
                onClick={handleSignIn} 
                className="bg-accent hover:bg-accent/90"
              >
                Sign in with Google
              </Button>
            </div>
          ) : (
            <div className="py-6">
              <div className="rounded-lg bg-slate-50 p-4 text-center">
                <h3 className="font-medium mb-1">Check your email</h3>
                <p className="text-sm text-slate-600">
                  We've sent a magic link to <span className="font-medium">{email}</span>
                </p>
              </div>
            </div>
          )}
          
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleAuthDialogClose}>
              {isEmailSent ? "Close" : "Cancel"}
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Index;
