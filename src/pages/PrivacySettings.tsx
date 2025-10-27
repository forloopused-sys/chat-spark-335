import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Shield, Lock, Eye, EyeOff, Key } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { database } from '@/lib/firebase';
import { ref, onValue, set, get } from 'firebase/database';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const PrivacySettings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    readReceipts: true,
    lastSeen: true,
    requireRequest: false,
  });
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');

  useEffect(() => {
    if (!user) return;

    const settingsRef = ref(database, `userSettings/${user.uid}/privacy`);
    const unsubscribe = onValue(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        setSettings(snapshot.val());
      }
    });

    // Check if PIN is set
    const pinRef = ref(database, `users/${user.uid}/lockPin`);
    get(pinRef).then((snapshot) => {
      setHasPin(snapshot.exists());
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

  const handleSetupPin = async () => {
    if (!user) return;

    if (pin.length !== 6) {
      toast({
        title: 'Invalid PIN',
        description: 'PIN must be 6 digits',
        variant: 'destructive',
      });
      return;
    }

    if (pin !== confirmPin) {
      toast({
        title: 'PIN Mismatch',
        description: 'PINs do not match',
        variant: 'destructive',
      });
      return;
    }

    if (!securityQuestion || !securityAnswer) {
      toast({
        title: 'Security Question Required',
        description: 'Please provide a security question and answer',
        variant: 'destructive',
      });
      return;
    }

    const pinRef = ref(database, `users/${user.uid}/lockPin`);
    await set(pinRef, {
      pin,
      securityQuestion,
      securityAnswer: securityAnswer.toLowerCase().trim(),
    });

    setHasPin(true);
    setShowPinSetup(false);
    setPin('');
    setConfirmPin('');
    setSecurityQuestion('');
    setSecurityAnswer('');

    toast({
      title: 'PIN Set Successfully',
      description: 'You can now lock chats',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <div className="max-w-2xl mx-auto px-4 md:px-0">
        <div className="bg-card border-b border-border p-4 flex items-center gap-3 sticky top-0 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/settings')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Shield className="w-5 h-5" />
          <h1 className="text-xl md:text-2xl font-bold">Privacy Settings</h1>
        </div>

        <div className="divide-y divide-border">
          {/* Lock PIN Setup */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                <Key className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium">Chat Lock PIN</div>
                <div className="text-sm text-muted-foreground">
                  {hasPin ? 'PIN is set for locked chats' : 'Set up PIN to lock chats'}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPinSetup(true)}
              className="shrink-0"
            >
              {hasPin ? 'Change' : 'Set Up'}
            </Button>
          </div>

          <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                {settings.readReceipts ? (
                  <Eye className="w-5 h-5 text-white" />
                ) : (
                  <EyeOff className="w-5 h-5 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium">Read Receipts</div>
                <div className="text-sm text-muted-foreground">
                  Let others see when you've read their messages
                </div>
              </div>
            </div>
            <Switch
              checked={settings.readReceipts}
              onCheckedChange={(value) => updateSetting('readReceipts', value)}
              className="shrink-0"
            />
          </div>

          <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium">Last Seen</div>
                <div className="text-sm text-muted-foreground">
                  Show when you were last online
                </div>
              </div>
            </div>
            <Switch
              checked={settings.lastSeen}
              onCheckedChange={(value) => updateSetting('lastSeen', value)}
              className="shrink-0"
            />
          </div>

          <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium">Message Requests</div>
                <div className="text-sm text-muted-foreground">
                  Require others to send a request before messaging you
                </div>
              </div>
            </div>
            <Switch
              checked={settings.requireRequest}
              onCheckedChange={(value) => updateSetting('requireRequest', value)}
              className="shrink-0"
            />
          </div>
        </div>
      </div>

      {/* PIN Setup Dialog */}
      <Dialog open={showPinSetup} onOpenChange={setShowPinSetup}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Set Up Chat Lock PIN</DialogTitle>
            <DialogDescription>
              Create a 6-digit PIN to lock your chats and a security question for recovery
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="pin">6-Digit PIN</Label>
              <Input
                id="pin"
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit PIN"
              />
            </div>
            <div>
              <Label htmlFor="confirmPin">Confirm PIN</Label>
              <Input
                id="confirmPin"
                type="password"
                maxLength={6}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Re-enter PIN"
              />
            </div>
            <div>
              <Label htmlFor="securityQuestion">Security Question</Label>
              <Input
                id="securityQuestion"
                value={securityQuestion}
                onChange={(e) => setSecurityQuestion(e.target.value)}
                placeholder="e.g., What is your pet's name?"
              />
            </div>
            <div>
              <Label htmlFor="securityAnswer">Answer</Label>
              <Input
                id="securityAnswer"
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
                placeholder="Your answer"
              />
            </div>
            <Button
              onClick={handleSetupPin}
              className="w-full"
              disabled={!pin || !confirmPin || !securityQuestion || !securityAnswer}
            >
              Set PIN
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PrivacySettings;
