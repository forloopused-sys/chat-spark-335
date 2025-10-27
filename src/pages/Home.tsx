import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Settings, Users, Bell, Archive, Lock, BadgeCheck, MessageSquare } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { database } from '@/lib/firebase';
import { ref, onValue, get, set } from 'firebase/database';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Chat {
  userId: string;
  username: string;
  lastMessage: string;
  timestamp: number;
  unreadCount: number;
  verified?: boolean;
  archived?: boolean;
  locked?: boolean;
  profilePic?: string;
}

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [hasArchivedChats, setHasArchivedChats] = useState(false);
  const [hasLockedChats, setHasLockedChats] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }

    // Check if user is admin
    const adminRef = ref(database, `admins/${user.uid}`);
    get(adminRef).then((snapshot) => {
      setIsAdmin(snapshot.exists());
    });

    const chatsRef = ref(database, `userChats/${user.uid}`);
    const unsubscribe = onValue(chatsRef, async (snapshot) => {
      if (snapshot.exists()) {
        const chatData = snapshot.val();
        const chatList: Chat[] = [];
        let archivedCount = 0;
        let lockedCount = 0;

        for (const chatId in chatData) {
          const chat = chatData[chatId];
          const otherUserId = chatId.replace(user.uid, '').replace('_', '');
          
          const userRef = ref(database, `users/${otherUserId}`);
          const userSnapshot = await get(userRef);
          
          if (userSnapshot.exists()) {
            const userData = userSnapshot.val();
            if (!chat.archived && !chat.locked) {
              chatList.push({
                userId: otherUserId,
                username: userData.username,
                lastMessage: chat.lastMessage || '',
                timestamp: chat.timestamp || 0,
                unreadCount: chat.unreadCount || 0,
                verified: userData.verified || false,
                profilePic: userData.profilePic || '',
              });
            }
            if (chat.archived) archivedCount++;
            if (chat.locked) lockedCount++;
          }
        }

        chatList.sort((a, b) => b.timestamp - a.timestamp);
        setChats(chatList);
        setHasArchivedChats(archivedCount > 0);
        setHasLockedChats(lockedCount > 0);
      }
    });

    // Listen to notifications
    const notifRef = ref(database, `userNotifications/${user.uid}`);
    const notifUnsubscribe = onValue(notifRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const unreadCount = Object.values(data).filter((n: any) => !n.read).length;
        setNotificationCount(unreadCount);
      } else {
        setNotificationCount(0);
      }
    });

    return () => {
      unsubscribe();
      notifUnsubscribe();
    };
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

  const handleArchiveChat = async (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    const chatId = [user.uid, userId].sort().join('_');
    const chatRef = ref(database, `userChats/${user.uid}/${chatId}/archived`);
    await set(chatRef, true);
    setSelectedChat(null);
  };

  const handleLockChat = async (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    
    // Check if PIN is set
    const pinRef = ref(database, `users/${user.uid}/lockPin`);
    const pinSnapshot = await get(pinRef);
    
    if (!pinSnapshot.exists()) {
      navigate('/privacy-settings');
      return;
    }
    
    const chatId = [user.uid, userId].sort().join('_');
    const chatRef = ref(database, `userChats/${user.uid}/${chatId}/locked`);
    await set(chatRef, true);
    setSelectedChat(null);
  };

  const handleChatClick = async (userId: string) => {
    if (!user) return;
    const chatId = [user.uid, userId].sort().join('_');
    // Clear unread count when opening chat
    const chatRef = ref(database, `userChats/${user.uid}/${chatId}/unreadCount`);
    await set(chatRef, 0);
    navigate(`/chat/${userId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 pb-16 md:pb-0">
      <div className="max-w-2xl mx-auto">
        <div className="bg-card border-b border-border p-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold">Lumina Messenger</h1>
          </div>
          <div className="flex gap-1 sm:gap-2">
            {isAdmin && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/admin')}
                className="relative"
                title="Admin Dashboard"
              >
                <Settings className="w-5 h-5 text-primary" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/notifications')}
              className="relative"
            >
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSearch(!showSearch)}
              className="md:flex"
            >
              <Search className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/contacts')}
              className="hidden md:flex"
            >
              <Users className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/settings')}
              className="hidden md:flex"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {(hasArchivedChats || hasLockedChats) && (
          <div className="bg-card border-b border-border p-2 flex gap-2">
            {hasArchivedChats && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/archive')}
                className="flex items-center gap-2"
              >
                <Archive className="w-4 h-4" />
                Archived
              </Button>
            )}
            {hasLockedChats && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/locked')}
                className="flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Locked
              </Button>
            )}
          </div>
        )}

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
                onClick={() => handleChatClick(chat.userId)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setSelectedChat(selectedChat === chat.userId ? null : chat.userId);
                }}
                className="p-4 hover:bg-accent/50 cursor-pointer transition-colors flex items-center gap-4 relative"
              >
                {chat.profilePic ? (
                  <img
                    src={chat.profilePic}
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold">
                    {chat.username[0].toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">@{chat.username}</span>
                    {chat.verified && (
                      <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500" />
                    )}
                    <span className="text-xs text-muted-foreground ml-auto">
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
                {selectedChat === chat.userId && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-card border border-border rounded-lg shadow-lg p-2 flex flex-col gap-1 z-10">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => handleArchiveChat(chat.userId, e)}
                      className="justify-start"
                    >
                      <Archive className="w-4 h-4 mr-2" />
                      Archive
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => handleLockChat(chat.userId, e)}
                      className="justify-start"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Lock
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="fixed bottom-20 right-6 md:bottom-6">
          <Button
            size="icon"
            onClick={() => navigate('/contacts')}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg"
          >
            <MessageSquare className="w-6 h-6" />
          </Button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Home;
