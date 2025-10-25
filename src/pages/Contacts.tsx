import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { database } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';

interface UserProfile {
  uid: string;
  username: string;
  name: string;
  email: string;
  status: string;
}

const Contacts = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) return;

    const usersRef = ref(database, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const userList: UserProfile[] = Object.entries(data)
          .map(([uid, userData]: any) => ({
            uid,
            ...userData,
          }))
          .filter((u) => u.uid !== user.uid); // Exclude current user
        
        setUsers(userList);
        setFilteredUsers(userList);
      }
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter((u) =>
        u.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const handleUserClick = (userId: string) => {
    navigate(`/chat/${userId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/home')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold">Contacts</h1>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by username..."
            className="pl-10"
          />
        </div>
      </div>

      <div className="p-4 space-y-2">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchQuery ? 'No users found' : 'No contacts available'}
            </p>
          </div>
        ) : (
          filteredUsers.map((userProfile) => (
            <div
              key={userProfile.uid}
              onClick={() => handleUserClick(userProfile.uid)}
              className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:bg-accent/10 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold text-lg">
                {userProfile.username[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="font-semibold">@{userProfile.username}</div>
                <div className="text-sm text-muted-foreground">{userProfile.name}</div>
              </div>
              <div className={`w-3 h-3 rounded-full ${
                userProfile.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
              }`} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Contacts;
