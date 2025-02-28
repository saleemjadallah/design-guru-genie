
import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface FollowUpPromptProps {
  isSubscribed?: boolean;
}

export const FollowUpPrompt = ({ isSubscribed: propIsSubscribed }: FollowUpPromptProps) => {
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(propIsSubscribed || false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSubscription = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        // Check if the user has is_subscribed in their metadata
        const isUserSubscribed = session.user.user_metadata?.is_subscribed === true;
        setIsSubscribed(isUserSubscribed);
      }
    };
    
    checkSubscription();
  }, [propIsSubscribed]);

  const handleFollowUpClick = () => {
    if (!isSubscribed) {
      setShowSubscribeModal(true);
    } else {
      // Navigate to follow-up upload page
      navigate("/follow-up-analysis");
    }
  };

  return (
    <>
      <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-100">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Follow-Up Analysis</h3>
        
        <p className="text-gray-700 mb-4">
          After implementing our recommended changes, submit your updated design for a follow-up analysis to:
        </p>
        
        <ul className="list-disc pl-5 mb-4 text-gray-700 space-y-1">
          <li>Measure improvement with before/after metrics</li>
          <li>Identify any remaining issues</li>
          <li>Get expert verification that changes were implemented correctly</li>
          <li>Receive a professional progress report you can share with stakeholders</li>
        </ul>
        
        <Button 
          onClick={handleFollowUpClick}
          className="bg-accent hover:bg-accent/90"
        >
          {isSubscribed ? "Submit Follow-Up Design" : "Subscribe to Unlock Follow-Up Analysis"}
        </Button>
      </div>

      {/* Subscription Modal */}
      <AlertDialog open={showSubscribeModal} onOpenChange={setShowSubscribeModal}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl text-center">
              Upgrade to Access Follow-Up Analysis
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-gray-600">
              The follow-up analysis is a premium feature included in our subscription plan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="bg-blue-50 p-4 rounded-lg my-4">
            <div className="flex items-center text-blue-700 font-medium mb-2">
              <Check className="w-5 h-5 mr-2" />
              Your free initial analysis doesn't count
            </div>
            <p className="text-gray-700 text-sm">
              Your first design critique is always free. The follow-up analysis is a separate premium feature available only to subscribers.
            </p>
          </div>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-start">
              <Check className="w-5 h-5 text-green-500 mt-0.5 mr-2" />
              <span className="text-gray-700">Track progress with before/after metrics</span>
            </div>
            <div className="flex items-start">
              <Check className="w-5 h-5 text-green-500 mt-0.5 mr-2" />
              <span className="text-gray-700">Get professional verification of improvements</span>
            </div>
            <div className="flex items-start">
              <Check className="w-5 h-5 text-green-500 mt-0.5 mr-2" />
              <span className="text-gray-700">Share progress reports with your team</span>
            </div>
          </div>
          
          <AlertDialogFooter className="flex-col gap-2 sm:gap-0">
            <AlertDialogAction asChild>
              <Button 
                className="w-full sm:w-auto bg-accent hover:bg-accent/90"
                onClick={() => {
                  // For testing: Set the user as subscribed
                  if (user) {
                    const updatedUser = {
                      ...user,
                      user_metadata: {
                        ...user.user_metadata,
                        is_subscribed: true
                      }
                    };
                    setUser(updatedUser);
                    setIsSubscribed(true);
                  }
                }}
              >
                Subscribe for $18/month
              </Button>
            </AlertDialogAction>
            <AlertDialogCancel className="w-full sm:w-auto mt-2 sm:mt-0">
              Cancel
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
