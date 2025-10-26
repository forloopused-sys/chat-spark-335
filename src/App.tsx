import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
