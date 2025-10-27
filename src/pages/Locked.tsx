import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  const [showForgotPin, setShowForgotPin] = useState(false);
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');

  useEffect(() => {
    if (!user) return;

    // Load security question
    const loadSecurityQuestion = async () => {
      const pinRef = ref(database, `users/${user.uid}/lockPin`);
      const snapshot = await get(pinRef);
      if (snapshot.exists()) {
        setSecurityQuestion(snapshot.val().securityQuestion || '');
      }
    };
    
    loadSecurityQuestion();

    // Load locked chats
    const chatsRef = ref(database, `userChats/${user.uid}`);
    const unsubscribe = onValue(chatsRef, async (snapshot) => {
      if (snapshot.exists()) {
        const chatData = snapshot.val();
        const lockedList: LockedChat[] = [];

        for (const chatId in chatData) {
          const chat = chatData[chatId];
          if (chat.locked) {
            // Extract other user ID from chatId
            const otherUserId = chatId.replace(user.uid, '').replace(/_/g, '');
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

        setLockedChats(lockedList.sort((a, b) => b.timestamp - a.timestamp));
      }
    });

    return () => unsubscribe();
  }, [user]);

  const verifyPin = async () => {
    if (!user) return;
    
    const pinRef = ref(database, `users/${user.uid}/lockPin`);
    const pinSnapshot = await get(pinRef);
    
    if (pinSnapshot.exists() && pinSnapshot.val().pin === pin) {
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

  const verifySecurityAnswer = async () => {
    if (!user) return;

    const pinRef = ref(database, `users/${user.uid}/lockPin`);
    const snapshot = await get(pinRef);
    
    if (snapshot.exists()) {
      const storedAnswer = snapshot.val().securityAnswer?.toLowerCase().trim();
      const userAnswer = securityAnswer.toLowerCase().trim();
      
      if (storedAnswer === userAnswer) {
        setShowForgotPin(false);
        setShowPinPrompt(false);
        setSecurityAnswer('');
        toast({
          title: 'Security Verified',
          description: 'You can now access locked chats',
        });
      } else {
        toast({
          title: 'Incorrect Answer',
          description: 'Please try again',
          variant: 'destructive',
        });
      }
    }
  };

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

  if (showForgotPin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card p-6 rounded-lg border border-border">
          <div className="text-center mb-6">
            <Lock className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h2 className="text-xl md:text-2xl font-bold mb-2">Security Question</h2>
            <p className="text-sm md:text-base text-muted-foreground">Answer your security question to access locked chats</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label className="text-sm md:text-base">{securityQuestion}</Label>
              <Input
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
                placeholder="Your answer"
                className="mt-2"
              />
            </div>
            <Button
              onClick={verifySecurityAnswer}
              className="w-full"
              disabled={!securityAnswer.trim()}
            >
              Verify
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setShowForgotPin(false);
                setSecurityAnswer('');
              }}
              className="w-full"
            >
              Back to PIN
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (showPinPrompt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card p-6 rounded-lg border border-border">
          <div className="text-center mb-6">
            <Lock className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h2 className="text-xl md:text-2xl font-bold mb-2">Enter PIN</h2>
            <p className="text-sm md:text-base text-muted-foreground">Enter your 6-digit PIN to access locked chats</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="pin" className="text-sm md:text-base">6-Digit PIN</Label>
              <Input
                id="pin"
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter PIN"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && pin.length === 6) {
                    verifyPin();
                  }
                }}
              />
            </div>
            <Button
              onClick={verifyPin}
              className="w-full"
              disabled={pin.length !== 6}
            >
              Unlock
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowForgotPin(true)}
              className="w-full"
            >
              Forgot PIN?
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('/home')}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
          <Lock className="w-5 h-5" />
          <h1 className="text-xl md:text-2xl font-bold">Locked Chats</h1>
        </div>

        <div className="divide-y divide-border">
          {lockedChats.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Lock className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 opacity-20" />
              <p className="text-sm md:text-base">No locked conversations</p>
            </div>
          ) : (
            lockedChats.map((chat) => (
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
                    unlockChat(chat.userId);
                  }}
                  className="shrink-0 text-xs md:text-sm"
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
