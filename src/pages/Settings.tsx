import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Shield, HelpCircle, Info, CheckCircle, LogOut } from 'lucide-react';
import { database, auth } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { signOut } from 'firebase/auth';

const Settings = () => {
  const navigate = useNavigate();
  const [helpLink, setHelpLink] = useState('');

  useEffect(() => {
    const settingsRef = ref(database, 'settings/helpLink');
    onValue(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        setHelpLink(snapshot.val());
      }
    });
  }, []);

  const handleLogout = async () => {
    // Clear cookies on logout
    localStorage.removeItem('rememberedEmail');
    localStorage.removeItem('rememberedPassword');
    localStorage.removeItem('autoLoginEnabled');
    
    await signOut(auth);
    navigate('/signin');
  };

  const settingsItems = [
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: Shield, label: 'Account', path: '/account' },
    { icon: Shield, label: 'Privacy', path: '/privacy-settings' },
    { icon: CheckCircle, label: 'Version', path: '/version' },
    { icon: HelpCircle, label: 'Help', link: helpLink, badge: !helpLink ? 'Coming Soon' : undefined },
    { icon: Info, label: 'About', path: '/about' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <div className="max-w-2xl mx-auto">
        <div className="bg-card border-b border-border p-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/home')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        <div className="divide-y divide-border">
          {settingsItems.map((item, index) => (
            <div
              key={index}
              onClick={() => {
                if (item.path) navigate(item.path);
                else if (item.link) window.open(item.link, '_blank');
              }}
              className={`p-4 flex items-center gap-4 ${
                item.path || item.link ? 'hover:bg-accent/50 cursor-pointer' : ''
              } transition-colors`}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white">
                <item.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="font-medium">{item.label}</div>
              </div>
              {item.badge && (
                <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                  {item.badge}
                </span>
              )}
            </div>
          ))}

          <div
            onClick={handleLogout}
            className="p-4 flex items-center gap-4 hover:bg-accent/50 cursor-pointer transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-destructive to-red-600 flex items-center justify-center text-white">
              <LogOut className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-destructive">Logout</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
