import React, { useEffect, useState } from "react";
import {
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import ReviewDetail from "@/pages/ReviewDetail";
import SavedReviews from "@/pages/SavedReviews";
import { supabase } from "@/integrations/supabase/client";
import FollowUpResults from "@/pages/FollowUpResults";
import { Navigation } from "@/components/layout/Navigation";

// Simple layout components to replace the missing ones
const Layout = ({ children }: { children: React.ReactNode }) => {
  return <div className="min-h-screen flex flex-col">{children}</div>;
};

const SiteHeader = () => {
  return (
    <header className="py-4 px-6 bg-white border-b">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/7a4a7d46-2665-4c5b-9666-801339014a81.png" 
              alt="Evolvely.ai Logo" 
              className="h-24"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

const SiteFooter = () => {
  return (
    <footer className="py-6 px-6 bg-gray-100 mt-auto">
      <div className="container mx-auto">
        <div className="text-center text-gray-600">
          <p>© {new Date().getFullYear()} Evolvely.ai - All Rights Reserved</p>
        </div>
      </div>
    </footer>
  );
};

// Separate the ScrollToTop component to avoid nested router issues
export const ScrollToTop = () => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
};

const App = () => {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <Layout>
      <Navigation />
      <ScrollToTop />
      {/* Main Content Routes - No Auth Required for Demo */}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/analysis/:id" element={<ReviewDetail />} />
        <Route path="/saved-reviews" element={<SavedReviews />} />
        <Route path="/follow-up-results" element={<FollowUpResults />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <SiteFooter />
    </Layout>
  );
};

export default App;
