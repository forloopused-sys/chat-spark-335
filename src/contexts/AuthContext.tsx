import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, database } from '@/lib/firebase';
import { ref, onDisconnect, serverTimestamp, set, onValue } from 'firebase/database';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);

      if (user) {
        const userStatusRef = ref(database, `users/${user.uid}/status`);
        const userLastSeenRef = ref(database, `users/${user.uid}/lastSeen`);
        
        set(userStatusRef, 'online');
        
        onDisconnect(userStatusRef).set('offline');
        onDisconnect(userLastSeenRef).set(serverTimestamp());
      }
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
