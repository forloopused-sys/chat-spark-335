import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, database } from '@/lib/firebase';
import { ref, onDisconnect, serverTimestamp, set, onValue, get } from 'firebase/database';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  useEffect(() => {
    // Check maintenance mode
    const maintenanceRef = ref(database, 'settings/maintenance');
    onValue(maintenanceRef, (snapshot) => {
      setMaintenanceMode(snapshot.val() || false);
    });
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);

      if (user) {
        const userStatusRef = ref(database, `users/${user.uid}/status`);
        const userLastSeenRef = ref(database, `users/${user.uid}/lastSeen`);
        
        set(userStatusRef, 'online');
        
        onDisconnect(userStatusRef).set('offline');
        onDisconnect(userLastSeenRef).set(serverTimestamp());

        // Check if maintenance mode and redirect non-admin users
        if (maintenanceMode) {
          const adminRef = ref(database, `admins/${user.uid}`);
          const adminSnap = await get(adminRef);
          
          if (!adminSnap.exists() && window.location.pathname !== '/maintenance') {
            window.location.href = '/maintenance';
          }
        } else {
          // If maintenance is disabled and user is on maintenance page, redirect to home
          if (window.location.pathname === '/maintenance') {
            window.location.href = '/home';
          }
        }
      }
    });

    return unsubscribe;
  }, [maintenanceMode]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
