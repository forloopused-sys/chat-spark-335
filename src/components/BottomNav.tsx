import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-2 flex justify-around items-center z-50 md:hidden">
      <Button
        variant={isActive('/home') ? 'default' : 'ghost'}
        size="icon"
        onClick={() => navigate('/home')}
        className="flex flex-col gap-1 h-auto py-2"
      >
        <Home className="w-5 h-5" />
        <span className="text-xs">Home</span>
      </Button>
      <Button
        variant={isActive('/contacts') ? 'default' : 'ghost'}
        size="icon"
        onClick={() => navigate('/contacts')}
        className="flex flex-col gap-1 h-auto py-2"
      >
        <Users className="w-5 h-5" />
        <span className="text-xs">Contacts</span>
      </Button>
      <Button
        variant={isActive('/settings') ? 'default' : 'ghost'}
        size="icon"
        onClick={() => navigate('/settings')}
        className="flex flex-col gap-1 h-auto py-2"
      >
        <Settings className="w-5 h-5" />
        <span className="text-xs">Settings</span>
      </Button>
    </div>
  );
};

export default BottomNav;
