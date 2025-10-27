import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Bell, CheckCircle, X, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { database } from '@/lib/firebase';
import { ref, onValue, set } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface Notification {
  id: string;
  type: 'request' | 'admin' | 'system';
  message: string;
  from?: string;
  fromUsername?: string;
  videoUrl?: string;
  imageUrl?: string;
  timestamp: number;
  read?: boolean;
}

const Notifications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const notificationsRef = ref(database, `userNotifications/${user.uid}`);
    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const notifList: Notification[] = Object.entries(data).map(([id, notif]: any) => ({
          id,
          ...notif,
        }));
        setNotifications(notifList.sort((a, b) => b.timestamp - a.timestamp));
      } else {
        setNotifications([]);
      }
    });

    // Listen to global admin notifications
    const adminNotifRef = ref(database, 'notifications');
    const adminUnsubscribe = onValue(adminNotifRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const adminNotifs: Notification[] = Object.entries(data).map(([id, notif]: any) => ({
          id,
          type: 'admin',
          ...notif,
        }));
        setNotifications((prev) => [...adminNotifs, ...prev].sort((a, b) => b.timestamp - a.timestamp));
      }
    });

    return () => {
      unsubscribe();
      adminUnsubscribe();
    };
  }, [user]);

  const acceptRequest = async (notificationId: string, fromUserId: string) => {
    if (!user) return;

    // Add to contacts
    const contactRef = ref(database, `contacts/${user.uid}/${fromUserId}`);
    await set(contactRef, true);

    const theirContactRef = ref(database, `contacts/${fromUserId}/${user.uid}`);
    await set(theirContactRef, true);

    // Remove notification
    const notifRef = ref(database, `userNotifications/${user.uid}/${notificationId}`);
    await set(notifRef, null);

    toast({
      title: 'Request Accepted',
      description: 'You can now message each other',
    });
  };

  const rejectRequest = async (notificationId: string) => {
    if (!user) return;
    const notifRef = ref(database, `userNotifications/${user.uid}/${notificationId}`);
    await set(notifRef, null);
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
          <Bell className="w-5 h-5" />
          <h1 className="text-2xl font-bold">Notifications</h1>
        </div>

        <div className="divide-y divide-border">
          {notifications.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Bell className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p>No notifications</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div key={notification.id} className="p-4 bg-card hover:bg-accent/30 transition-colors">
                {notification.type === 'request' ? (
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold">
                        {notification.fromUsername?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">@{notification.fromUsername}</div>
                        <div className="text-sm text-muted-foreground">{notification.message}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => acceptRequest(notification.id, notification.from!)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => rejectRequest(notification.id)}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Decline
                      </Button>
                    </div>
                  </div>
                ) : notification.type === 'admin' ? (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-5 h-5 text-primary" />
                      <span className="font-semibold">Admin Notification</span>
                    </div>
                    <p className="text-sm mb-3">{notification.message}</p>
                    {notification.imageUrl && (
                      <img
                        src={notification.imageUrl}
                        alt="Notification"
                        className="rounded-lg mb-3 max-h-48 object-cover cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setFullscreenImage(notification.imageUrl)}
                      />
                    )}
                    {notification.videoUrl && (
                      <div className="aspect-video rounded-lg overflow-hidden mb-3">
                        <iframe
                          src={notification.videoUrl.replace('m.youtube.com', 'www.youtube.com').replace('watch?v=', 'embed/')}
                          className="w-full h-full"
                          allowFullScreen
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm">{notification.message}</p>
                )}
                <div className="text-xs text-muted-foreground mt-2">
                  {new Date(notification.timestamp).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      <Dialog open={!!fullscreenImage} onOpenChange={() => setFullscreenImage(null)}>
        <DialogContent className="max-w-4xl p-0 bg-black/90">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setFullscreenImage(null)}
            className="absolute top-4 right-4 text-white hover:bg-white/20 z-50"
          >
            <X className="w-6 h-6" />
          </Button>
          {fullscreenImage && (
            <img src={fullscreenImage} alt="Full screen" className="w-full h-auto" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Notifications;
