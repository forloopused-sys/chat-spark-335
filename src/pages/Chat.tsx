import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, MoreVertical } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { database } from '@/lib/firebase';
import { ref, onValue, push, set, get, serverTimestamp, remove } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  status: 'sent' | 'seen';
  deleted?: boolean;
  edited?: boolean;
}

const Chat = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!user || !userId) return;

    const chatId = [user.uid, userId].sort().join('_');
    const messagesRef = ref(database, `messages/${chatId}`);
    
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const messageList: Message[] = Object.entries(data).map(([id, msg]: any) => ({
          id,
          ...msg,
        }));
        messageList.sort((a, b) => a.timestamp - b.timestamp);
        setMessages(messageList);
      } else {
        setMessages([]);
      }
    });

    const userRef = ref(database, `users/${userId}`);
    get(userRef).then((snapshot) => {
      if (snapshot.exists()) {
        setOtherUser(snapshot.val());
      }
    });

    const typingRef = ref(database, `typing/${chatId}/${userId}`);
    const typingUnsubscribe = onValue(typingRef, (snapshot) => {
      setIsTyping(snapshot.val() === true);
    });

    return () => {
      unsubscribe();
      typingUnsubscribe();
    };
  }, [user, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleTyping = () => {
    if (!user || !userId) return;

    const chatId = [user.uid, userId].sort().join('_');
    const typingRef = ref(database, `typing/${chatId}/${user.uid}`);
    
    set(typingRef, true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      set(typingRef, false);
    }, 1000);
  };

  const sendMessage = async () => {
    if (!message.trim() || !user || !userId) return;

    const chatId = [user.uid, userId].sort().join('_');
    const messagesRef = ref(database, `messages/${chatId}`);

    if (editingMessageId) {
      const messageRef = ref(database, `messages/${chatId}/${editingMessageId}`);
      await set(messageRef, {
        senderId: user.uid,
        text: message,
        timestamp: Date.now(),
        status: 'sent',
        edited: true,
      });
      setEditingMessageId(null);
    } else {
      await push(messagesRef, {
        senderId: user.uid,
        text: message,
        timestamp: Date.now(),
        status: 'sent',
      });

      const userChatRef = ref(database, `userChats/${userId}/${chatId}`);
      await set(userChatRef, {
        lastMessage: message,
        timestamp: Date.now(),
        unreadCount: (await get(userChatRef)).val()?.unreadCount || 0 + 1,
      });

      const myChatsRef = ref(database, `userChats/${user.uid}/${chatId}`);
      await set(myChatsRef, {
        lastMessage: message,
        timestamp: Date.now(),
      });
    }

    setMessage('');
    
    const typingRef = ref(database, `typing/${chatId}/${user.uid}`);
    set(typingRef, false);
  };

  const deleteMessage = async (messageId: string) => {
    if (!user || !userId) return;

    const chatId = [user.uid, userId].sort().join('_');
    const messageRef = ref(database, `messages/${chatId}/${messageId}`);
    
    await set(messageRef, {
      senderId: user.uid,
      text: 'This message deleted',
      timestamp: Date.now(),
      status: 'sent',
      deleted: true,
    });
    
    toast({
      title: 'Message Deleted',
      description: 'The message has been removed',
    });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-background to-secondary/30">
      <div className="bg-card border-b border-border p-4 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/home')}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold">
          {otherUser?.username?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="font-semibold">@{otherUser?.username}</div>
          <div className="text-xs text-muted-foreground">
            {otherUser?.status === 'online' ? 'Online' : `Last seen ${otherUser?.lastSeen ? formatTime(otherUser.lastSeen) : 'recently'}`}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
          >
            <div className="group relative max-w-[70%]">
              <div
                className={`rounded-2xl px-4 py-2 ${
                  msg.senderId === user?.uid
                    ? 'bg-gradient-to-r from-primary to-accent text-white'
                    : 'bg-card border border-border'
                }`}
              >
                <p className={`break-words ${msg.deleted ? 'italic opacity-60' : ''}`}>
                  {msg.text}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <span className={`text-xs ${msg.senderId === user?.uid ? 'text-white/70' : 'text-muted-foreground'}`}>
                    {formatTime(msg.timestamp)}
                  </span>
                  {msg.senderId === user?.uid && (
                    <span className="text-xs text-white/70">
                      {msg.status === 'seen' ? '✓✓' : '✓'}
                    </span>
                  )}
                </div>
              </div>
              {msg.senderId === user?.uid && !msg.deleted && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute -right-8 top-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => {
                      setMessage(msg.text);
                      setEditingMessageId(msg.id);
                    }}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => deleteMessage(msg.id)}>
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-card border border-border rounded-2xl px-4 py-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-card border-t border-border p-4">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={editingMessageId ? 'Edit message...' : 'Type a message...'}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
            size="icon"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
