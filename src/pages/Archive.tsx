import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Archive as ArchiveIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { database } from '@/lib/firebase';
import { ref, onValue, set, get } from 'firebase/database';

interface ArchivedChat {
  userId: string;
  username: string;
  lastMessage: string;
  timestamp: number;
}

const Archive = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [archivedChats, setArchivedChats] = useState<ArchivedChat[]>([]);

  useEffect(() => {
    if (!user) return;

    const loadArchivedChats = async () => {
      const chatsRef = ref(database, `userChats/${user.uid}`);
      const snapshot = await get(chatsRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const archived: ArchivedChat[] = [];

        for (const chatId in data) {
          const chat = data[chatId];
          if (chat.archived) {
            // Extract other user ID from chatId
            const otherUserId = chatId.replace(user.uid, '').replace(/_/g, '');
            const userRef = ref(database, `users/${otherUserId}`);
            const userSnapshot = await get(userRef);
            
            if (userSnapshot.exists()) {
              archived.push({
                userId: otherUserId,
                username: userSnapshot.val().username,
                lastMessage: chat.lastMessage || '',
                timestamp: chat.timestamp || 0,
              });
            }
          }
        }

        setArchivedChats(archived.sort((a, b) => b.timestamp - a.timestamp));
      }
    };

    loadArchivedChats();

    // Set up real-time listener
    const chatsRef = ref(database, `userChats/${user.uid}`);
    const unsubscribe = onValue(chatsRef, () => {
      loadArchivedChats();
    });

    return () => unsubscribe();
  }, [user]);

  const unarchiveChat = async (userId: string) => {
    if (!user) return;
    const chatId = [user.uid, userId].sort().join('_');
    const chatRef = ref(database, `userChats/${user.uid}/${chatId}/archived`);
    await set(chatRef, false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 pb-16 md:pb-0">
      <div className="max-w-2xl mx-auto px-4 md:px-0">
        <div className="bg-card border-b border-border p-4 flex items-center gap-3 sticky top-0 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/home')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <ArchiveIcon className="w-5 h-5" />
          <h1 className="text-xl md:text-2xl font-bold">Archived Chats</h1>
        </div>

        <div className="divide-y divide-border">
          {archivedChats.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <ArchiveIcon className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 opacity-20" />
              <p className="text-sm md:text-base">No archived conversations</p>
            </div>
          ) : (
            archivedChats.map((chat) => (
              <div
                key={chat.userId}
                className="p-4 flex items-center gap-3 md:gap-4 hover:bg-accent/50 transition-colors"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold shrink-0">
                  {chat.username[0]?.toUpperCase()}
                </div>
                <div 
                  className="flex-1 min-w-0 cursor-pointer" 
                  onClick={() => navigate(`/chat/${chat.userId}`)}
                >
                  <div className="font-semibold text-sm md:text-base">@{chat.username}</div>
                  <div className="text-xs md:text-sm text-muted-foreground truncate">
                    {chat.lastMessage}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    unarchiveChat(chat.userId);
                  }}
                  className="shrink-0 text-xs md:text-sm"
                >
                  Unarchive
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Archive;
