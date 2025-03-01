import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useCookies } from "react-cookie";

import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import ReviewDetail from "@/pages/ReviewDetail";
import SavedReviews from "@/pages/SavedReviews";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import Pricing from "@/pages/Pricing";
import { Layout } from "@/components/layout/Layout";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import FollowUpAnalysis from "@/pages/FollowUpAnalysis";
import FollowUpResults from "@/pages/FollowUpResults";

const App = () => {
  const [cookies, setCookie, removeCookie] = useCookies([
    "supabase-auth-token",
  ]);
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
        {/* Auth Routes */}
        {!session ? (
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={["github", "google"]}
            redirectTo={`${window.location.origin}/saved-reviews`}
          />
        ) : (
          <>
            {/* Main Content Routes */}
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/analysis/:id" element={<ReviewDetail />} />
              <Route path="/saved-reviews" element={<SavedReviews />} />
              <Route path="/follow-up-analysis" element={<FollowUpAnalysis />} />
              <Route path="/follow-up-results" element={<FollowUpResults />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </>
        )}
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
