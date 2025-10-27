import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CookieConsent } from "@/components/CookieConsent";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import Splash from "./pages/Splash";
import Welcome from "./pages/Welcome";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Contacts from "./pages/Contacts";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Account from "./pages/Account";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import AdminDashboard from "./pages/AdminDashboard";
import BlockMessage from "./pages/BlockMessage";
import Notifications from "./pages/Notifications";
import About from "./pages/About";
import PrivacySettings from "./pages/PrivacySettings";
import Archive from "./pages/Archive";
import Locked from "./pages/Locked";
import NotFound from "./pages/NotFound";
import UserDetail from "./pages/UserDetail";
import Version from "./pages/Version";
import Maintenance from "./pages/Maintenance";
import AIChat from "./pages/AIChat";
import SelfChat from "./pages/SelfChat";

const queryClient = new QueryClient();

const AppContent = () => {
  useKeyboardShortcuts();
  return (
    <>
      <CookieConsent />
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/home" element={<Home />} />
        <Route path="/chat/:userId" element={<Chat />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/account" element={<Account />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/blocked" element={<BlockMessage />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy-settings" element={<PrivacySettings />} />
        <Route path="/archive" element={<Archive />} />
        <Route path="/locked" element={<Locked />} />
        <Route path="/user/:userId" element={<UserDetail />} />
        <Route path="/version" element={<Version />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/ai-chat" element={<AIChat />} />
        <Route path="/self-chat" element={<SelfChat />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
