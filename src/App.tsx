import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import Events from "./pages/Events";
import Media from "./pages/Media";
import NewMember from "./pages/NewMember";
import Doctrinal from "./pages/Doctrinal";
import Forms from "./pages/Forms";
import ApostleProfile from "./pages/ApostleProfile";
import AltarCall from "./pages/AltarCall";
import BabyDedication from "./pages/BabyDedication";
import EventRegistration from "./pages/EventRegistration";
import NotFound from "./pages/NotFound";
import PreMaritalCounseling from "./pages/PreMaritalCounseling";
import Testimony from "./pages/Testimony";
import NewMemberRegistration from "./pages/NewMemberRegistration";
import Counselling from "./pages/Counselling";

const queryClient = new QueryClient();

// Allow a local dev API URL via env: VITE_API_URL (e.g. http://localhost:4000)

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/events" element={<Events />} />
          <Route path="/media" element={<Media />} />
          <Route path="/new-member" element={<NewMember />} />
          <Route path="/new-member-registration" element={<NewMemberRegistration />} />
          <Route path="/doctrine" element={<Doctrinal />} />
          <Route path="/forms" element={<Forms />} />
          <Route path="/counselling" element={<Counselling />} />
          <Route path="/baby-dedication" element={<BabyDedication />} />
          <Route path="/event-registration" element={<EventRegistration />} />
            <Route path="/pre-marital-counseling" element={<PreMaritalCounseling />} />
          <Route path="/testimony" element={<Testimony />} />
          <Route path="/apostle" element={<ApostleProfile />} />
          <Route path="/altar-call" element={<AltarCall />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
