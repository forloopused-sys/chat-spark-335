import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageCircle, Users, Shield, Zap } from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Connect Instantly',
    description: 'Start conversations with anyone, anytime'
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Your messages are encrypted and secure'
  },
  {
    icon: Zap,
    title: 'Real-time Updates',
    description: 'See messages and status updates instantly'
  }
];

const Welcome = () => {
  const navigate = useNavigate();
  const [showFeatures, setShowFeatures] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {!showFeatures ? (
          <div className="text-center animate-fade-in">
            <div className="mb-8 inline-block p-6 rounded-full bg-gradient-to-br from-primary to-accent shadow-elegant">
              <MessageCircle className="w-16 h-16 text-white" strokeWidth={1.5} />
            </div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Welcome to Lumina Messenger
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Connect with friends and family through secure, real-time messaging
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => setShowFeatures(true)}
                className="w-full h-12 text-lg bg-gradient-to-r from-primary to-accent hover:opacity-90"
                size="lg"
              >
                Next
              </Button>
              <Button 
                onClick={() => navigate('/signup')}
                variant="ghost"
                className="w-full h-12 text-lg"
                size="lg"
              >
                Skip
              </Button>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold mb-8 text-center">Why Lumina Messenger?</h2>
            <div className="space-y-6 mb-8">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="flex gap-4 p-4 rounded-xl bg-card border border-border hover:shadow-card transition-all"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button 
              onClick={() => navigate('/signup')}
              className="w-full h-12 text-lg bg-gradient-to-r from-primary to-accent hover:opacity-90"
              size="lg"
            >
              Let's Go!
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Welcome;
