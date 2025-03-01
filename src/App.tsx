
import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import ReviewDetail from "@/pages/ReviewDetail";
import SavedReviews from "@/pages/SavedReviews";
import { supabase } from "@/integrations/supabase/client";
import FollowUpAnalysis from "@/pages/FollowUpAnalysis";
import FollowUpResults from "@/pages/FollowUpResults";

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
          <nav className="hidden md:flex gap-6">
            <a href="/" className="text-gray-700 hover:text-accent">Home</a>
            <a href="/saved-reviews" className="text-gray-700 hover:text-accent">Saved Reviews</a>
            <a href="/follow-up-analysis" className="text-gray-700 hover:text-accent">Follow-Up Analysis</a>
          </nav>
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
    <BrowserRouter>
      <ScrollToTop />
      <Layout>
        <SiteHeader />
        {/* Main Content Routes - No Auth Required for Demo */}
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/analysis/:id" element={<ReviewDetail />} />
          <Route path="/saved-reviews" element={<SavedReviews />} />
          <Route path="/follow-up-analysis" element={<FollowUpAnalysis />} />
          <Route path="/follow-up-results" element={<FollowUpResults />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <SiteFooter />
      </Layout>
    </BrowserRouter>
  );
};

// Helper component to scroll to top on route change
const ScrollToTop = () => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
};

export default App;
