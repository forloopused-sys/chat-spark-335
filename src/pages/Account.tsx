import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
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
