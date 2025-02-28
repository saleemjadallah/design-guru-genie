
import { Route, Routes } from "react-router-dom";
import Index from "./pages/Index";
import SavedReviews from "./pages/SavedReviews";
import ReviewDetail from "./pages/ReviewDetail";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/saved-reviews" element={<SavedReviews />} />
      <Route path="/review/:id" element={<ReviewDetail />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
