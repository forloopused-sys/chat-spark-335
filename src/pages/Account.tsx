import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Shield } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { database } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase';
import { 
  updateEmail, 
  updatePassword, 
  sendEmailVerification,
  signOut,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { ref, onValue, set, get } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const Account = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 2FA states
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [setupStep, setSetupStep] = useState(0);
  const [twoFAPin, setTwoFAPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');

  useEffect(() => {
    if (!user) return;
    
    const twoFARef = ref(database, `users/${user.uid}/twoFA`);
    const unsubscribe = onValue(twoFARef, (snapshot) => {
      if (snapshot.exists()) {
        setTwoFAEnabled(snapshot.val().enabled || false);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleChangeEmail = async () => {
    if (!user || !newEmail || !currentPassword) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user.email!, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      await updateEmail(user, newEmail);
      await sendEmailVerification(user);

      toast({
        title: 'Email Updated',
        description: 'Please check your new email to verify',
      });

      setNewEmail('');
      setCurrentPassword('');
    } catch (error: any) {
      toast({
        title: 'Failed to Update Email',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user || !currentPassword || !newPassword) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user.email!, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      await updatePassword(user, newPassword);

      toast({
        title: 'Password Updated',
        description: 'Your password has been changed successfully',
      });

      setCurrentPassword('');
      setNewPassword('');
    } catch (error: any) {
      toast({
        title: 'Failed to Update Password',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/signin');
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    try {
      await deleteUser(user);
      toast({
        title: 'Account Deleted',
        description: 'Your account has been permanently deleted',
      });
      navigate('/signup');
    } catch (error: any) {
      toast({
        title: 'Failed to Delete Account',
        description: 'Please re-login and try again',
        variant: 'destructive',
      });
    }
  };

  const handleToggle2FA = async () => {
    if (!user) return;

    if (twoFAEnabled) {
      // Disable 2FA
      const twoFARef = ref(database, `users/${user.uid}/twoFA`);
      await set(twoFARef, { enabled: false });
      setTwoFAEnabled(false);
      setSetupStep(0);
      toast({
        title: '2FA Disabled',
        description: 'Two-factor authentication has been disabled',
      });
    } else {
      // Start setup process
      setSetupStep(1);
    }
  };

  const handleSetup2FA = async () => {
    if (!user) return;

    if (setupStep === 1) {
      // Validate PIN
      if (twoFAPin.length !== 6 || !/^\d+$/.test(twoFAPin)) {
        toast({
          title: 'Invalid PIN',
          description: 'PIN must be 6 digits',
          variant: 'destructive',
        });
        return;
      }
      setSetupStep(2);
    } else if (setupStep === 2) {
      // Confirm PIN
      if (twoFAPin !== confirmPin) {
        toast({
          title: 'PIN Mismatch',
          description: 'PINs do not match',
          variant: 'destructive',
        });
        return;
      }
      setSetupStep(3);
    } else if (setupStep === 3) {
      // Save security question and answer
      if (!securityQuestion || !securityAnswer) {
        toast({
          title: 'Missing Information',
          description: 'Please provide security question and answer',
          variant: 'destructive',
        });
        return;
      }

      const twoFARef = ref(database, `users/${user.uid}/twoFA`);
      await set(twoFARef, {
        enabled: true,
        pin: twoFAPin,
        securityQuestion,
        securityAnswer: securityAnswer.toLowerCase().trim(),
      });

      setTwoFAEnabled(true);
      setSetupStep(0);
      setTwoFAPin('');
      setConfirmPin('');
      setSecurityQuestion('');
      setSecurityAnswer('');

      toast({
        title: '2FA Enabled',
        description: 'Two-factor authentication has been enabled',
      });
    }
  };

  const handleCancel2FASetup = () => {
    setSetupStep(0);
    setTwoFAPin('');
    setConfirmPin('');
    setSecurityQuestion('');
    setSecurityAnswer('');
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
          <h1 className="text-2xl font-bold">Account</h1>
        </div>

        <div className="p-4 space-y-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Change Email</h2>
            <div>
              <Label htmlFor="newEmail">New Email</Label>
              <Input
                id="newEmail"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="currentPasswordEmail">Current Password</Label>
              <Input
                id="currentPasswordEmail"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button
              onClick={handleChangeEmail}
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              Update Email
            </Button>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Change Password</h2>
            <div>
              <Label htmlFor="currentPasswordPwd">Current Password</Label>
              <Input
                id="currentPasswordPwd"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button
              onClick={handleChangePassword}
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              Update Password
            </Button>
          </div>

          {/* 2FA Section */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-primary" />
                <div>
                  <h2 className="text-xl font-semibold">Two-Factor Authentication</h2>
                  <p className="text-sm text-muted-foreground">Add extra security to your account</p>
                </div>
              </div>
              <Switch
                checked={twoFAEnabled}
                onCheckedChange={handleToggle2FA}
                disabled={setupStep > 0}
              />
            </div>

            {setupStep === 1 && (
              <div className="space-y-4 p-4 bg-accent/10 rounded-lg">
                <div>
                  <Label htmlFor="twoFAPin">Enter 6-Digit PIN</Label>
                  <Input
                    id="twoFAPin"
                    type="password"
                    maxLength={6}
                    value={twoFAPin}
                    onChange={(e) => setTwoFAPin(e.target.value.replace(/\D/g, ''))}
                    className="mt-1"
                    placeholder="Enter 6 digits"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSetup2FA} className="flex-1">Next</Button>
                  <Button onClick={handleCancel2FASetup} variant="outline">Cancel</Button>
                </div>
              </div>
            )}

            {setupStep === 2 && (
              <div className="space-y-4 p-4 bg-accent/10 rounded-lg">
                <div>
                  <Label htmlFor="confirmPin">Confirm 6-Digit PIN</Label>
                  <Input
                    id="confirmPin"
                    type="password"
                    maxLength={6}
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    className="mt-1"
                    placeholder="Re-enter 6 digits"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSetup2FA} className="flex-1">Next</Button>
                  <Button onClick={handleCancel2FASetup} variant="outline">Cancel</Button>
                </div>
              </div>
            )}

            {setupStep === 3 && (
              <div className="space-y-4 p-4 bg-accent/10 rounded-lg">
                <div>
                  <Label htmlFor="securityQuestion">Security Question</Label>
                  <Input
                    id="securityQuestion"
                    type="text"
                    value={securityQuestion}
                    onChange={(e) => setSecurityQuestion(e.target.value)}
                    className="mt-1"
                    placeholder="e.g., What is your mother's maiden name?"
                  />
                </div>
                <div>
                  <Label htmlFor="securityAnswer">Security Answer</Label>
                  <Input
                    id="securityAnswer"
                    type="text"
                    value={securityAnswer}
                    onChange={(e) => setSecurityAnswer(e.target.value)}
                    className="mt-1"
                    placeholder="Your answer"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSetup2FA} className="flex-1">Complete Setup</Button>
                  <Button onClick={handleCancel2FASetup} variant="outline">Cancel</Button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4 pt-4 border-t border-border">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full"
            >
              Logout
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    account and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount}>
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
