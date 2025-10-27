import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Cookie } from 'lucide-react';

export const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowBanner(false);
  };

  const rejectCookies = () => {
    localStorage.setItem('cookieConsent', 'rejected');
    // Clear any existing auth cookies
    localStorage.removeItem('rememberedEmail');
    localStorage.removeItem('rememberedPassword');
    localStorage.removeItem('autoLoginEnabled');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-card border-t border-border shadow-lg animate-fade-in">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-4">
        <div className="flex items-center gap-3 flex-1">
          <Cookie className="w-6 h-6 text-primary" />
          <p className="text-sm">
            We use cookies to enhance your experience, keep you signed in securely, and remember your preferences.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={rejectCookies}>
            Reject
          </Button>
          <Button onClick={acceptCookies}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
};
