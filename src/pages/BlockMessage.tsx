import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, LogOut } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

const BlockMessage = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/signin');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center">
        <div className="mb-6 inline-block p-6 rounded-full bg-destructive/10">
          <Shield className="w-16 h-16 text-destructive" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Account Blocked</h1>
        <p className="text-muted-foreground mb-8">
          Your account has been blocked by the administrator. If you believe this is a mistake, please contact support.
        </p>
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default BlockMessage;
