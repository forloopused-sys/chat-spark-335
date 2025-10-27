import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, Bot, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const AIChat = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }

    // Load chat history from localStorage
    const savedMessages = localStorage.getItem(`aiChat_${user.uid}`);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, [user, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyCkPXdWGCxb2u4NbvWDW-g7t7Wa5u2czUo`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are Lumina AI, a helpful and friendly AI assistant for Lumina Messenger. You help users with their questions and provide assistance. Current user message: ${input}`,
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      
      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        const aiMessage: Message = {
          role: 'assistant',
          content: data.candidates[0].content.parts[0].text,
          timestamp: Date.now(),
        };

        const updatedMessages = [...messages, userMessage, aiMessage];
        setMessages(updatedMessages);

        // Save to localStorage
        if (user) {
          localStorage.setItem(`aiChat_${user.uid}`, JSON.stringify(updatedMessages));
        }
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error) {
      console.error('AI Chat Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to get response from Lumina AI. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    if (user) {
      localStorage.removeItem(`aiChat_${user.uid}`);
    }
    toast({
      title: 'Chat Cleared',
      description: 'Your conversation history has been cleared.',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 flex flex-col">
      <div className="bg-card border-b border-border p-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/home')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold">Lumina AI</h1>
          <p className="text-xs text-muted-foreground">Your AI Assistant</p>
        </div>
        <Button variant="outline" size="sm" onClick={clearChat}>
          Clear Chat
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
              <Bot className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Hello! I'm Lumina AI</h2>
            <p className="text-muted-foreground max-w-md">
              I'm here to help you with any questions or assistance you need. Ask me anything!
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-70 mt-2">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-card border border-border rounded-2xl p-4">
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-card border-t border-border p-4">
        <div className="max-w-4xl mx-auto flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask Lumina AI anything..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={sendMessage} disabled={isLoading || !input.trim()}>
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
