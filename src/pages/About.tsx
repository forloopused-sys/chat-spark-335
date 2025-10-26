import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageCircle, Shield, Zap, Users } from 'lucide-react';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <div className="max-w-2xl mx-auto">
        <div className="bg-card border-b border-border p-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/settings')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">About</h1>
        </div>

        <div className="p-6 space-y-6">
          <div className="text-center">
            <div className="mb-6 inline-block p-6 rounded-full bg-gradient-to-br from-primary to-accent">
              <MessageCircle className="w-16 h-16 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Lumina Messenger</h2>
            <p className="text-muted-foreground">by Helio creation</p>
            <p className="text-sm text-muted-foreground mt-4">Version 1.0.0</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h3 className="text-xl font-semibold">Our Mission</h3>
            <p className="text-muted-foreground">
              Lumina Messenger is designed to provide secure, real-time communication 
              for everyone. We believe in connecting people through simple, elegant, 
              and private messaging.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-xl font-semibold">Features</h3>
            <div className="grid gap-3">
              <div className="flex items-start gap-3 p-4 bg-card border border-border rounded-lg">
                <Shield className="w-5 h-5 text-primary mt-1" />
                <div>
                  <div className="font-semibold">Secure & Private</div>
                  <div className="text-sm text-muted-foreground">
                    Your conversations are private and secure
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-card border border-border rounded-lg">
                <Zap className="w-5 h-5 text-primary mt-1" />
                <div>
                  <div className="font-semibold">Real-time Messaging</div>
                  <div className="text-sm text-muted-foreground">
                    Instant message delivery and status updates
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-card border border-border rounded-lg">
                <Users className="w-5 h-5 text-primary mt-1" />
                <div>
                  <div className="font-semibold">Connect with Anyone</div>
                  <div className="text-sm text-muted-foreground">
                    Find and message users easily
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 space-y-2">
            <h3 className="text-xl font-semibold">Contact</h3>
            <p className="text-sm text-muted-foreground">
              © 2024 Helio creation. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
