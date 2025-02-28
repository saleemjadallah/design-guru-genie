import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/layout/Navigation";
import { FollowUpSubmission } from "@/components/analysis/FollowUpSubmission";
import { ProgressDashboard } from "@/components/analysis/ProgressDashboard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

enum AnalysisStage {
  LOADING,
  UPLOAD,
  ANALYZING,
  COMPLETE
}

const FollowUpAnalysis = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stage, setStage] = useState<AnalysisStage>(AnalysisStage.LOADING);
  const [initialAnalysis, setInitialAnalysis] = useState<any>(null);
  const [followUpImageUrl, setFollowUpImageUrl] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<any>(null);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to access this feature.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      // Here you would normally check if the user has an active subscription
      // For now, we'll simulate that the user is subscribed
      setIsSubscribed(true);
      
      // Fetch the initial analysis data
      if (id) {
        try {
          // Here you would normally fetch the data from your database
          // For now, we'll simulate a successful fetch
          setInitialAnalysis({
            id,
            imageUrl: "https://via.placeholder.com/600x400",
            score: 68,
            issuesCount: 9,
            // ... other analysis data
          });
          setStage(AnalysisStage.UPLOAD);
        } catch (error) {
          console.error("Error fetching analysis:", error);
          toast({
            title: "Error",
            description: "Could not load the initial analysis data.",
            variant: "destructive",
          });
          navigate('/');
        }
      }
    };

    checkAuth();
  }, [id, navigate]);

  const handleSubmissionComplete = (imageUrl: string) => {
    setFollowUpImageUrl(imageUrl);
    setStage(AnalysisStage.ANALYZING);
    
    // Simulate analysis process
    setTimeout(() => {
      // Here you would normally send the image for analysis
      // and then get back the results
      
      // For now, we'll simulate a successful analysis
      setProgressData({
        initialScore: 68,
        followUpScore: 86,
        issuesResolved: 7,
        totalIssues: 9,
        impactLevel: "High",
        conversionEstimate: "+15-20%",
        categoryImprovements: [
          { name: "Visual Hierarchy", beforeScore: 52, afterScore: 76 },
          { name: "Color Consistency", beforeScore: 45, afterScore: 85 },
          { name: "Accessibility", beforeScore: 60, afterScore: 78 },
          { name: "Information Architecture", beforeScore: 70, afterScore: 85 }
        ],
        beforeImageUrl: initialAnalysis?.imageUrl,
        afterImageUrl: imageUrl,
        remainingIssues: [
          "Improve mobile responsiveness for small screens",
          "Enhance form validation feedback"
        ]
      });
      
      setStage(AnalysisStage.COMPLETE);
      
      toast({
        title: "Analysis complete",
        description: "Your follow-up analysis is ready to view.",
      });
    }, 3000);
  };

  const renderContent = () => {
    switch (stage) {
      case AnalysisStage.LOADING:
        return (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader className="w-8 h-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Loading analysis data...</p>
          </div>
        );
        
      case AnalysisStage.UPLOAD:
        if (!isSubscribed) {
          return (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Subscription Required</h2>
              <p className="text-gray-600 mb-6">
                The follow-up analysis feature lets you track your design progress over time with before/after comparisons. 
                Your free initial analysis doesn't count toward this feature.
              </p>
              <Button className="bg-accent hover:bg-accent/90">
                Subscribe for $18/month
              </Button>
            </div>
          );
        }
        
        return (
          <FollowUpSubmission 
            initialAnalysisId={id || ''}
            onSubmissionComplete={handleSubmissionComplete}
          />
        );
        
      case AnalysisStage.ANALYZING:
        return (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader className="w-8 h-8 animate-spin text-blue-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Analyzing Your Progress</h3>
            <p className="text-gray-600">
              We're comparing your updated design with the original to measure your improvements...
            </p>
          </div>
        );
        
      case AnalysisStage.COMPLETE:
        return <ProgressDashboard {...progressData} />;
        
      default:
        return null;
    }
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 pt-16">
        <div className="container py-12">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <Button 
                variant="ghost" 
                className="flex items-center text-gray-600"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Follow-Up Analysis</h1>
            
            {renderContent()}
          </div>
        </div>
      </div>
    </>
  );
};

export default FollowUpAnalysis;
