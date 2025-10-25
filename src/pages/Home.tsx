import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Settings, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { database } from '@/lib/firebase';
import { ref, onValue, get, query, orderByChild } from 'firebase/database';

interface Chat {
  userId: string;
  username: string;
  lastMessage: string;
  timestamp: number;
  unreadCount: number;
}

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }

    const chatsRef = ref(database, `userChats/${user.uid}`);
    const unsubscribe = onValue(chatsRef, async (snapshot) => {
      if (snapshot.exists()) {
        const chatData = snapshot.val();
        const chatList: Chat[] = [];

        for (const chatId in chatData) {
          const chat = chatData[chatId];
          const otherUserId = chatId.replace(user.uid, '').replace('_', '');
          
          const userRef = ref(database, `users/${otherUserId}`);
          const userSnapshot = await get(userRef);
          
          if (userSnapshot.exists()) {
            chatList.push({
              userId: otherUserId,
              username: userSnapshot.val().username,
              lastMessage: chat.lastMessage || '',
              timestamp: chat.timestamp || 0,
              unreadCount: chat.unreadCount || 0,
            });
          }
        }

        chatList.sort((a, b) => b.timestamp - a.timestamp);
        setChats(chatList);
      }
    });

    return () => unsubscribe();
  }, [user, navigate]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const filteredChats = chats.filter(chat =>
    chat.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <div className="max-w-2xl mx-auto">
        <div className="bg-card border-b border-border p-4 flex items-center justify-between sticky top-0 z-10">
          <h1 className="text-2xl font-bold">ChatNow</h1>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/contacts')}
            >
              <Users className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSearch(!showSearch)}
            >
              <Search className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/settings')}
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {showSearch && (
          <div className="p-4 bg-card border-b border-border">
            <Input
              placeholder="Search usernames..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
        )}

        <div className="divide-y divide-border">
          {filteredChats.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>No conversations yet</p>
              <p className="text-sm mt-2">Search for users to start chatting</p>
            </div>
          ) : (
            filteredChats.map((chat) => (
              <div
                key={chat.userId}
                onClick={() => navigate(`/chat/${chat.userId}`)}
                className="p-4 hover:bg-accent/50 cursor-pointer transition-colors flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold">
                  {chat.username[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold">@{chat.username}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(chat.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {chat.lastMessage}
                  </p>
                </div>
                {chat.unreadCount > 0 && (
                  <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-white text-xs font-semibold">
                    {chat.unreadCount}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
