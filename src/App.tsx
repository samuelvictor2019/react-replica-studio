import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import FloatingActions from "@/components/FloatingActions";
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
import FaithfulStewards from "./pages/FaithfulStewards";
import HouseGroups from "./pages/HouseGroups";
import Contact from "./pages/Contact";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminEventsPage from "./pages/admin/AdminEventsPage";
import AdminMediaPage from "./pages/admin/AdminMediaPage";
import AdminMembersPage from "./pages/admin/AdminMembersPage";
import AdminTestimoniesPage from "./pages/admin/AdminTestimoniesPage";
import AdminPagesPage from "./pages/admin/AdminPagesPage";
import AdminAnalyticsPage from "./pages/admin/AdminAnalyticsPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import AdminCollectionPage from "./pages/admin/AdminCollectionPage";
import AdminFormsPage from "./pages/admin/AdminFormsPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminAppointmentsPage from "./pages/admin/AdminAppointmentsPage";

const queryClient = new QueryClient();

// Allow a local dev API URL via env: VITE_API_URL (e.g. http://localhost:4000)

const TitleUpdater = () => {
  const location = useLocation();

  useEffect(() => {
    const titles: Record<string, string> = {
      "/": "Home",
      "/about": "About",
      "/events": "Events",
      "/media": "Media",
      "/new-member": "New Member",
      "/new-member-registration": "New Member Registration",
      "/doctrine": "Doctrine",
      "/contact": "Contact Us",
      "/forms": "Forms",
      "/counselling": "Counselling",
      "/baby-dedication": "Baby Dedication",
      "/event-registration": "Event Registration",
      "/pre-marital-counseling": "Pre‑Marital Counseling",
      "/testimony": "Testimony",
      "/apostle": "Apostle",
      "/stewards": "Faithful Stewards",
      "/altar-call": "Altar Call",
    };

    const title = (location.pathname.startsWith('/event-registration/')
      ? 'Event Registration'
      : titles[location.pathname]) ?? (() => {
      const seg = location.pathname.split("/").filter(Boolean).pop() ?? "Page";
      return seg.split("-").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
    })();

    document.title = `WaterGate Church | ${title}`;
  }, [location]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <FloatingActions />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/events" element={<Events />} />
          <Route path="/media" element={<Media />} />
          <Route path="/new-member" element={<NewMember />} />
          <Route path="/new-member-registration" element={<NewMemberRegistration />} />
          <Route path="/doctrine" element={<Doctrinal />} />
          <Route path="/forms" element={<Forms />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/counselling" element={<Counselling />} />
          <Route path="/baby-dedication" element={<BabyDedication />} />
          <Route path="/event-registration" element={<EventRegistration />} />
          <Route path="/event-registration/:eventId" element={<EventRegistration />} />
            <Route path="/pre-marital-counseling" element={<PreMaritalCounseling />} />
          <Route path="/testimony" element={<Testimony />} />
           <Route path="/apostle" element={<ApostleProfile />} />
           <Route path="/stewards" element={<FaithfulStewards />} />
           <Route path="/altar-call" element={<AltarCall />} />
           <Route path="/house-groups" element={<HouseGroups />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="events" element={<AdminEventsPage />} />
            <Route path="media" element={<AdminMediaPage />} />
            <Route path="members" element={<AdminMembersPage />} />
            <Route path="testimonies" element={<AdminTestimoniesPage />} />
            <Route path="pages" element={<AdminPagesPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route path="forms" element={<AdminFormsPage />} />
            <Route path="appointments" element={<AdminAppointmentsPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="collection/:collection" element={<AdminCollectionPage />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
