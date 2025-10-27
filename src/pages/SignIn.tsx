import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, database } from '@/lib/firebase';
import { ref, get, set } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const SignIn = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [twoFAPin, setTwoFAPin] = useState('');
  const [pendingUser, setPendingUser] = useState<any>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check cooldown
    if (cooldownUntil && Date.now() < cooldownUntil) {
      const remainingTime = Math.ceil((cooldownUntil - Date.now()) / 1000 / 60);
      toast({
        title: 'Too Many Attempts',
        description: `Please wait ${remainingTime} minute(s) before trying again`,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      let email = emailOrUsername;

      if (!emailOrUsername.includes('@')) {
        const usernameRef = ref(database, `usernames/${emailOrUsername}`);
        const snapshot = await get(usernameRef);
        
        if (snapshot.exists()) {
          const uid = snapshot.val();
          const userRef = ref(database, `users/${uid}`);
          const userSnapshot = await get(userRef);
          
          if (userSnapshot.exists()) {
            email = userSnapshot.val().email;
          } else {
            throw new Error('User not found');
          }
        } else {
          throw new Error('Username not found');
        }
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Check maintenance mode
      const maintenanceRef = ref(database, 'settings/maintenance');
      const maintenanceSnap = await get(maintenanceRef);
      
      if (maintenanceSnap.exists() && maintenanceSnap.val()) {
        const adminRef = ref(database, `admins/${userCredential.user.uid}`);
        const adminSnap = await get(adminRef);
        
        if (!adminSnap.exists()) {
          await auth.signOut();
          navigate('/maintenance');
          return;
        }
      }

      // Check if user is blocked
      const userRef = ref(database, `users/${userCredential.user.uid}`);
      const userSnapshot = await get(userRef);
      
      if (userSnapshot.exists() && userSnapshot.val().blocked) {
        await auth.signOut();
        navigate('/blocked');
        return;
      }

      // Check for 2FA
      const twoFARef = ref(database, `users/${userCredential.user.uid}/twoFA`);
      const twoFASnap = await get(twoFARef);
      
      if (twoFASnap.exists() && twoFASnap.val().enabled) {
        setPendingUser(userCredential.user);
        setShow2FA(true);
        setLoading(false);
        return;
      }

      // Reset failed attempts on success
      setFailedAttempts(0);
      setCooldownUntil(null);

      // Check if admin
      const adminRef = ref(database, `admins/${userCredential.user.uid}`);
      const adminSnap = await get(adminRef);
      
      if (adminSnap.exists()) {
        navigate('/admin');
        return;
      }

      toast({
        title: 'Welcome Back!',
        description: 'Successfully signed in',
      });

      navigate('/home');
    } catch (error: any) {
      // Handle failed attempt
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      // Set cooldown based on attempts
      if (newAttempts >= 3) {
        const cooldownMinutes = newAttempts === 3 ? 1 : 5;
        const cooldown = Date.now() + (cooldownMinutes * 60 * 1000);
        setCooldownUntil(cooldown);
        
        toast({
          title: 'Too Many Failed Attempts',
          description: `Account locked for ${cooldownMinutes} minute(s)`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Sign In Failed',
          description: error.message || 'Invalid credentials',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handle2FAVerification = async () => {
    if (!pendingUser) return;

    try {
      const twoFARef = ref(database, `users/${pendingUser.uid}/twoFA`);
      const twoFASnap = await get(twoFARef);
      
      if (twoFASnap.exists()) {
        const twoFAData = twoFASnap.val();
        
        if (twoFAData.pin === twoFAPin) {
          // Success - reset attempts
          setFailedAttempts(0);
          setCooldownUntil(null);
          setShow2FA(false);

          // Check if admin
          const adminRef = ref(database, `admins/${pendingUser.uid}`);
          const adminSnap = await get(adminRef);
          
          if (adminSnap.exists()) {
            navigate('/admin');
            return;
          }

          toast({
            title: 'Welcome Back!',
            description: 'Successfully signed in',
          });

          navigate('/home');
        } else {
          // Failed 2FA attempt
          const newAttempts = failedAttempts + 1;
          setFailedAttempts(newAttempts);

          if (newAttempts >= 3) {
            const cooldownMinutes = newAttempts === 3 ? 1 : 5;
            const cooldown = Date.now() + (cooldownMinutes * 60 * 1000);
            setCooldownUntil(cooldown);
            
            await auth.signOut();
            setShow2FA(false);
            
            toast({
              title: 'Too Many Failed Attempts',
              description: `Please wait ${cooldownMinutes} minute(s) and sign in again`,
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Incorrect PIN',
              description: 'Please try again',
              variant: 'destructive',
            });
          }
          setTwoFAPin('');
        }
      }
    } catch (error: any) {
      toast({
        title: 'Verification Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to continue to Lumina Messenger</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="emailOrUsername">Email or Username</Label>
            <Input
              id="emailOrUsername"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              required
              className="mt-1"
              placeholder="email@example.com or username"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            />
            <label htmlFor="remember" className="text-sm">
              Remember me
            </label>
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90"
            disabled={loading || (cooldownUntil && Date.now() < cooldownUntil)}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:underline">
              Sign Up
            </Link>
          </p>
        </form>
      </div>

      {/* 2FA Dialog */}
      <Dialog open={show2FA} onOpenChange={setShow2FA}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Enter your 6-digit PIN to continue
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="2faPin">6-Digit PIN</Label>
              <Input
                id="2faPin"
                type="password"
                maxLength={6}
                value={twoFAPin}
                onChange={(e) => setTwoFAPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter PIN"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && twoFAPin.length === 6) {
                    handle2FAVerification();
                  }
                }}
              />
            </div>
            <Button
              onClick={handle2FAVerification}
              className="w-full"
              disabled={twoFAPin.length !== 6}
            >
              Verify
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SignIn;
