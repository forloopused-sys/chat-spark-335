import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { database } from '@/lib/firebase';
import { ref, get } from 'firebase/database';

const Version = () => {
  const navigate = useNavigate();
  const [version, setVersion] = useState('');
  const [whatsNew, setWhatsNew] = useState<string[]>([]);

  useEffect(() => {
    const versionRef = ref(database, 'settings/version');
    get(versionRef).then((snapshot) => {
      if (snapshot.exists()) {
        setVersion(snapshot.val());
      }
    });

    const whatsNewRef = ref(database, 'settings/whatsNew');
    get(whatsNewRef).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const features = Object.values(data).sort((a: any, b: any) => b.timestamp - a.timestamp) as any[];
        setWhatsNew(features);
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <div className="max-w-2xl mx-auto">
        <div className="bg-card border-b border-border p-4 flex items-center gap-3 sticky top-0 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/settings')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Version</h1>
        </div>

        <div className="p-4 space-y-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-sm text-muted-foreground mb-2">Current Version</h2>
            <p className="text-3xl font-bold">{version || '1.0.0'}</p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold">What's New</h2>
            {whatsNew.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-6 text-center text-muted-foreground">
                No updates yet
              </div>
            ) : (
              whatsNew.map((feature: any, index) => (
                <div key={index} className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    <div className="flex-1">
                      <p className="text-foreground">{feature.text}</p>
                      {feature.timestamp && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(feature.timestamp).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Version;
