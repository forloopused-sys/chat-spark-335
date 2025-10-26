import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { database } from '@/lib/firebase';
import { ref, onValue, set } from 'firebase/database';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

const PrivacySettings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    readReceipts: true,
    lastSeen: true,
    requireRequest: false,
  });

  useEffect(() => {
    if (!user) return;

    const settingsRef = ref(database, `userSettings/${user.uid}/privacy`);
    const unsubscribe = onValue(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        setSettings(snapshot.val());
      }
    });

    return () => unsubscribe();
  }, [user]);

  const updateSetting = async (key: string, value: boolean) => {
    if (!user) return;

    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    const settingsRef = ref(database, `userSettings/${user.uid}/privacy`);
    await set(settingsRef, newSettings);

    toast({
      title: 'Privacy Settings Updated',
      description: 'Your privacy settings have been saved',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <div className="max-w-2xl mx-auto">
        <div className="bg-card border-b border-border p-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/settings')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Shield className="w-5 h-5" />
          <h1 className="text-2xl font-bold">Privacy Settings</h1>
        </div>

        <div className="divide-y divide-border">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                {settings.readReceipts ? (
                  <Eye className="w-5 h-5 text-white" />
                ) : (
                  <EyeOff className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <div className="font-medium">Read Receipts</div>
                <div className="text-sm text-muted-foreground">
                  Let others see when you've read their messages
                </div>
              </div>
            </div>
            <Switch
              checked={settings.readReceipts}
              onCheckedChange={(value) => updateSetting('readReceipts', value)}
            />
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-medium">Last Seen</div>
                <div className="text-sm text-muted-foreground">
                  Show when you were last online
                </div>
              </div>
            </div>
            <Switch
              checked={settings.lastSeen}
              onCheckedChange={(value) => updateSetting('lastSeen', value)}
            />
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-medium">Message Requests</div>
                <div className="text-sm text-muted-foreground">
                  Require others to send a request before messaging you
                </div>
              </div>
            </div>
            <Switch
              checked={settings.requireRequest}
              onCheckedChange={(value) => updateSetting('requireRequest', value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacySettings;
