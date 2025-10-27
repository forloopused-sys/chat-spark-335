import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, X } from 'lucide-react';
import { database } from '@/lib/firebase';
import { ref, get } from 'firebase/database';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const UserDetail = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [userDetail, setUserDetail] = useState<any>(null);
  const [showFullImage, setShowFullImage] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const userRef = ref(database, `users/${userId}`);
    get(userRef).then((snapshot) => {
      if (snapshot.exists()) {
        setUserDetail(snapshot.val());
      }
    });
  }, [userId]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatLastSeen = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
  };

  if (!userDetail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <div className="max-w-2xl mx-auto">
        <div className="bg-card border-b border-border p-4 flex items-center gap-3 sticky top-0 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">User Details</h1>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex justify-center">
            {userDetail.profilePic ? (
              <img
                src={userDetail.profilePic}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setShowFullImage(true)}
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-5xl font-bold">
                {userDetail.name?.[0]?.toUpperCase() || userDetail.username?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Full Name</p>
              <p className="text-lg font-semibold">{userDetail.name || 'Not set'}</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Username</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold">@{userDetail.username}</p>
                {userDetail.verified && (
                  <CheckCircle className="w-5 h-5 text-primary fill-primary" />
                )}
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Last Seen</p>
              <p className="text-lg">
                {userDetail.status === 'online'
                  ? 'Online'
                  : userDetail.lastSeen
                  ? formatLastSeen(userDetail.lastSeen)
                  : 'Recently'}
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Sign Up Date</p>
              <p className="text-lg">
                {userDetail.createdAt ? formatDate(userDetail.createdAt) : 'Unknown'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showFullImage} onOpenChange={setShowFullImage}>
        <DialogContent className="max-w-4xl p-0 bg-black/90">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowFullImage(false)}
            className="absolute top-4 right-4 text-white hover:bg-white/20 z-50"
          >
            <X className="w-6 h-6" />
          </Button>
          {userDetail.profilePic && (
            <img
              src={userDetail.profilePic}
              alt="Profile"
              className="w-full h-auto"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserDetail;
