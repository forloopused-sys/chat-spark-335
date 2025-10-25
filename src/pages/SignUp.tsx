import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft } from 'lucide-react';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth, database } from '@/lib/firebase';
import { ref, set, get } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  phone: z.string().min(10, 'Invalid phone number').max(15),
  age: z.string().refine((val) => {
    const num = parseInt(val);
    return num >= 13 && num <= 120;
  }, 'Age must be between 13 and 120'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(20).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const SignUp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    age: '',
    username: '',
    email: '',
    password: '',
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const checkUsernameAvailable = async (username: string): Promise<boolean> => {
    const usernamesRef = ref(database, `usernames/${username}`);
    const snapshot = await get(usernamesRef);
    return !snapshot.exists();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreedToTerms) {
      toast({
        title: 'Agreement Required',
        description: 'Please agree to the terms and privacy policy',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      
      const validated = signUpSchema.parse(formData);
      
      const isAvailable = await checkUsernameAvailable(validated.username);
      if (!isAvailable) {
        toast({
          title: 'Username Taken',
          description: 'This username is already in use',
          variant: 'destructive',
        });
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        validated.email,
        validated.password
      );

      await sendEmailVerification(userCredential.user);

      await set(ref(database, `users/${userCredential.user.uid}`), {
        name: validated.name,
        phone: validated.phone,
        age: validated.age,
        username: validated.username,
        email: validated.email,
        createdAt: Date.now(),
        status: 'online',
      });

      await set(ref(database, `usernames/${validated.username}`), userCredential.user.uid);

      toast({
        title: 'Account Created!',
        description: 'Please check your email to verify your account',
      });

      navigate('/home');
    } catch (error: any) {
      toast({
        title: 'Sign Up Failed',
        description: error.message || 'Please check your information and try again',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 p-4">
      <div className="max-w-md mx-auto pt-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-muted-foreground">Welcome to ChatNow</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              name="age"
              type="number"
              value={formData.age}
              onChange={handleChange}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="username">Username (@handle)</Label>
            <Input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="mt-1"
              placeholder="username"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="mt-1"
            />
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
            />
            <label htmlFor="terms" className="text-sm leading-relaxed">
              I agree to the{' '}
              <Link to="/terms" className="text-primary hover:underline">
                Terms and Conditions
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </label>
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/signin" className="text-primary hover:underline">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
