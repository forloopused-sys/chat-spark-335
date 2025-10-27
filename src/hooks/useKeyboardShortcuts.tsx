import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Only enable on desktop (screen width > 768px)
    if (window.innerWidth <= 768) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + key shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'h':
            e.preventDefault();
            navigate('/home');
            break;
          case 'n':
            e.preventDefault();
            navigate('/notifications');
            break;
          case 's':
            e.preventDefault();
            navigate('/settings');
            break;
          case 'c':
            e.preventDefault();
            navigate('/contacts');
            break;
          case 'a':
            e.preventDefault();
            navigate('/archive');
            break;
          case 'l':
            e.preventDefault();
            navigate('/locked');
            break;
        }
      }

      // Alt + key shortcuts
      if (e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'm':
            e.preventDefault();
            navigate('/ai-chat');
            break;
          case 'p':
            e.preventDefault();
            navigate('/profile');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigate]);
};
