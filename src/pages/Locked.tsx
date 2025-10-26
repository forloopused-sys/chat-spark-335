import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { database } from '@/lib/firebase';
import { ref, onValue, get, set } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';

interface LockedChat {
  userId: string;
  username: string;
  lastMessage: string;
  timestamp: number;
}

const Locked = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [lockedChats, setLockedChats] = useState<LockedChat[]>([]);
  const [showPinPrompt, setShowPinPrompt] = useState(true);
  const [pin, setPin] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }

    const chatsRef = ref(database, `userChats/${user.uid}`);
    const unsubscribe = onValue(chatsRef, async (snapshot) => {
      if (snapshot.exists()) {
        const chatData = snapshot.val();
        const lockedList: LockedChat[] = [];

        for (const chatId in chatData) {
          const chat = chatData[chatId];
          if (chat.locked) {
            const otherUserId = chatId.replace(user.uid, '').replace('_', '');
            const userRef = ref(database, `users/${otherUserId}`);
            const userSnapshot = await get(userRef);
            
            if (userSnapshot.exists()) {
              lockedList.push({
                userId: otherUserId,
                username: userSnapshot.val().username,
                lastMessage: chat.lastMessage || '',
                timestamp: chat.timestamp || 0,
              });
            }
          }
        }

        setLockedChats(lockedList);
      }
    });

    return () => unsubscribe();
  }, [user, navigate]);

  const unlockChat = async (userId: string) => {
    if (!user) return;
    const chatId = [user.uid, userId].sort().join('_');
    const chatRef = ref(database, `userChats/${user.uid}/${chatId}/locked`);
    await set(chatRef, false);
    toast({
      title: 'Chat Unlocked',
      description: 'Chat has been unlocked',
    });
  };

  const verifyPin = async () => {
    if (!user) return;
    
    const pinRef = ref(database, `users/${user.uid}/pin`);
    const pinSnapshot = await get(pinRef);
    
    if (pinSnapshot.exists() && pinSnapshot.val() === pin) {
      setShowPinPrompt(false);
      toast({
        title: 'Access Granted',
        description: 'PIN verified successfully',
      });
    } else {
      toast({
        title: 'Invalid PIN',
        description: 'Please try again',
        variant: 'destructive',
      });
      setPin('');
    }
  };

  if (showPinPrompt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 flex items-center justify-center">
        <div className="max-w-md w-full p-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex flex-col items-center mb-6">
              <Lock className="w-16 h-16 text-primary mb-4" />
              <h2 className="text-2xl font-bold">Enter PIN</h2>
              <p className="text-sm text-muted-foreground mt-2">Enter your 6-digit PIN to access locked chats</p>
            </div>
            <Input
              type="password"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter 6-digit PIN"
              className="text-center text-2xl tracking-widest mb-4"
            />
            <div className="flex gap-2">
              <Button onClick={() => navigate('/home')} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button onClick={verifyPin} className="flex-1" disabled={pin.length !== 6}>
                Unlock
              </Button>
            </div>
            <Button
              variant="link"
              className="w-full mt-4"
              onClick={() => navigate('/privacy-settings')}
            >
              Forgot PIN?
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
          <Lock className="w-5 h-5" />
          <h1 className="text-2xl font-bold">Locked Chats</h1>
        </div>

        <div className="divide-y divide-border">
          {lockedChats.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Lock className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p>No locked chats</p>
            </div>
          ) : (
            lockedChats.map((chat) => (
              <div
                key={chat.userId}
                className="p-4 hover:bg-accent/50 transition-colors flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold">
                  {chat.username[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">@{chat.username}</div>
                  <p className="text-sm text-muted-foreground truncate">
                    {chat.lastMessage}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => unlockChat(chat.userId)}
                >
                  Unlock
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Locked;
