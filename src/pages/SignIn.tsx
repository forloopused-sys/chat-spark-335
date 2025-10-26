import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, database } from '@/lib/firebase';
import { ref, get } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';

const SignIn = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      // Check if user is blocked
      const userRef = ref(database, `users/${userCredential.user.uid}`);
      const userSnapshot = await get(userRef);
      
      if (userSnapshot.exists() && userSnapshot.val().blocked) {
        await auth.signOut();
        navigate('/blocked');
        return;
      }

      // Check if admin
      const ADMIN_EMAIL = 'nadeemmuhammed702@gmail.com';
      if (userCredential.user.email === ADMIN_EMAIL) {
        navigate('/admin');
        return;
      }

      toast({
        title: 'Welcome Back!',
        description: 'Successfully signed in',
      });

      navigate('/home');
    } catch (error: any) {
      toast({
        title: 'Sign In Failed',
        description: error.message || 'Invalid credentials',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
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
            disabled={loading}
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
    </div>
  );
};

export default SignIn;
