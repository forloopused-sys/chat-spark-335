import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Wrench } from 'lucide-react';

const Maintenance = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Admin can bypass maintenance
    if (user?.email === 'nadeemmuhammed702@gmail.com') {
      navigate('/admin');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border border-border rounded-lg p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Wrench className="w-12 h-12 text-white" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Under Maintenance</h1>
          <p className="text-muted-foreground">
            Lumina Messenger is currently undergoing maintenance. We'll be back soon!
          </p>
        </div>

        <div className="text-sm text-muted-foreground">
          Thank you for your patience.
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
