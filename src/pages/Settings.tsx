import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Shield, HelpCircle, Info, CheckCircle } from 'lucide-react';

const settingsItems = [
  { icon: User, label: 'Profile', path: '/profile' },
  { icon: Shield, label: 'Account', path: '/account' },
  { icon: Shield, label: 'Privacy', path: '/privacy-settings' },
  { icon: HelpCircle, label: 'Help', badge: 'Coming Soon' },
  { icon: Info, label: 'About', path: '/about' },
  { icon: CheckCircle, label: 'Version', value: '1.0.0' },
];

const Settings = () => {
  const navigate = useNavigate();

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
              onClick={() => item.path && navigate(item.path)}
              className={`p-4 flex items-center gap-4 ${
                item.path ? 'hover:bg-accent/50 cursor-pointer' : ''
              } transition-colors`}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white">
                <item.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="font-medium">{item.label}</div>
                {item.value && (
                  <div className="text-sm text-muted-foreground">{item.value}</div>
                )}
              </div>
              {item.badge && (
                <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                  {item.badge}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;
