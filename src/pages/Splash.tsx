import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Splash = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        if (user) {
          navigate('/home');
        } else {
          navigate('/welcome');
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [navigate, user, loading]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-accent to-primary animate-gradient bg-[length:200%_200%]">
      <div className="text-center animate-fade-in">
        <div className="mb-6 inline-block p-6 rounded-full bg-white/20 backdrop-blur-sm">
          <MessageCircle className="w-20 h-20 text-white" strokeWidth={1.5} />
        </div>
        <h1 className="text-5xl font-bold text-white mb-2">Lumina Messenger</h1>
        <p className="text-white/90 text-lg">by Helio creation</p>
      </div>
    </div>
  );
};

export default Splash;
