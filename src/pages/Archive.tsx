import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Archive as ArchiveIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { database } from '@/lib/firebase';
import { ref, onValue, set } from 'firebase/database';

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

    const archiveRef = ref(database, `archives/${user.uid}`);
    const unsubscribe = onValue(archiveRef, async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const archived: ArchivedChat[] = [];

        for (const userId in data) {
          const userRef = ref(database, `users/${userId}`);
          const userSnapshot = await onValue(userRef, (snap) => {
            if (snap.exists()) {
              archived.push({
                userId,
                username: snap.val().username,
                lastMessage: data[userId].lastMessage || '',
                timestamp: data[userId].timestamp || 0,
              });
            }
          });
        }

        setArchivedChats(archived.sort((a, b) => b.timestamp - a.timestamp));
      }
    });

    return () => unsubscribe();
  }, [user]);

  const unarchiveChat = async (userId: string) => {
    if (!user) return;
    const archiveRef = ref(database, `archives/${user.uid}/${userId}`);
    await set(archiveRef, null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <div className="max-w-2xl mx-auto">
        <div className="bg-card border-b border-border p-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/home')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <ArchiveIcon className="w-5 h-5" />
          <h1 className="text-2xl font-bold">Archived Chats</h1>
        </div>

        <div className="divide-y divide-border">
          {archivedChats.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <ArchiveIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p>No archived conversations</p>
            </div>
          ) : (
            archivedChats.map((chat) => (
              <div
                key={chat.userId}
                className="p-4 flex items-center gap-4 hover:bg-accent/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold">
                  {chat.username[0]?.toUpperCase()}
                </div>
                <div className="flex-1" onClick={() => navigate(`/chat/${chat.userId}`)}>
                  <div className="font-semibold">@{chat.username}</div>
                  <div className="text-sm text-muted-foreground truncate">
                    {chat.lastMessage}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => unarchiveChat(chat.userId)}
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
