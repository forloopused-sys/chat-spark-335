import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { database } from '@/lib/firebase';
import { ref, onValue, push, set } from 'firebase/database';

interface Message {
  text: string;
  timestamp: number;
}

const SelfChat = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }

    const messagesRef = ref(database, `selfMessages/${user.uid}`);
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const messageList = Object.values(data) as Message[];
        setMessages(messageList.sort((a, b) => a.timestamp - b.timestamp));
      } else {
        setMessages([]);
      }
    });

    return () => unsubscribe();
  }, [user, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !user) return;

    const messagesRef = ref(database, `selfMessages/${user.uid}`);
    const newMessageRef = push(messagesRef);

    await set(newMessageRef, {
      text: input,
      timestamp: Date.now(),
    });

    setInput('');
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 flex flex-col">
      <div className="bg-card border-b border-border p-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/home')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <User className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Personal Notes</h1>
          <p className="text-xs text-muted-foreground">Your private space</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
              <User className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Your Personal Notes</h2>
            <p className="text-muted-foreground max-w-md">
              Save notes, reminders, and messages to yourself. Only you can see these.
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className="flex justify-end">
              <div className="max-w-[80%] bg-primary text-primary-foreground rounded-2xl p-4">
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                <p className="text-xs opacity-70 mt-2">{formatTime(message.timestamp)}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-card border-t border-border p-4">
        <div className="max-w-4xl mx-auto flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Write a note to yourself..."
            className="flex-1"
          />
          <Button onClick={sendMessage} disabled={!input.trim()}>
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SelfChat;
