import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { database } from '@/lib/firebase';
import { ref, get, set } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    age: '',
    username: '',
    email: '',
    profilePic: '',
  });
  const [loading, setLoading] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }

    const userRef = ref(database, `users/${user.uid}`);
    get(userRef).then((snapshot) => {
      if (snapshot.exists()) {
        setProfile(snapshot.val());
      }
    });
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const userRef = ref(database, `users/${user.uid}`);
      await set(userRef, {
        ...profile,
        updatedAt: Date.now(),
      });

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been saved successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameChange = async () => {
    if (!user || !newUsername.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a username',
        variant: 'destructive',
      });
      return;
    }

    // Check if username is unique
    const usersRef = ref(database, 'users');
    const snapshot = await get(usersRef);
    if (snapshot.exists()) {
      const users = snapshot.val();
      const usernameExists = Object.values(users).some(
        (u: any) => u.username === newUsername && u.uid !== user.uid
      );
      
      if (usernameExists) {
        toast({
          title: 'Username Taken',
          description: 'This username is already in use',
          variant: 'destructive',
        });
        return;
      }
    }

    setLoading(true);
    try {
      const userRef = ref(database, `users/${user.uid}`);
      await set(userRef, {
        ...profile,
        username: newUsername,
        updatedAt: Date.now(),
      });

      setProfile({ ...profile, username: newUsername });
      setIsEditingUsername(false);
      setNewUsername('');

      toast({
        title: 'Username Updated',
        description: `Your new username is @${newUsername}`,
      });
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-2xl font-bold">Profile</h1>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex justify-center mb-6">
            {profile.profilePic ? (
              <img
                src={profile.profilePic}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-3xl font-bold">
                {profile.name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="profilePic">Profile Picture URL</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="profilePic"
                name="profilePic"
                value={profile.profilePic}
                onChange={handleChange}
                placeholder="Paste image URL"
              />
              <Button
                onClick={() => window.open('https://luminamessanger.page.gd', '_blank')}
                variant="outline"
              >
                Upload
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              value={profile.name}
              onChange={handleChange}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              name="age"
              value={profile.age}
              onChange={handleChange}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="username">Username</Label>
            {isEditingUsername ? (
              <div className="flex gap-2 mt-1">
                <Input
                  id="newUsername"
                  name="newUsername"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="@username"
                />
                <Button
                  onClick={handleUsernameChange}
                  disabled={loading}
                  variant="outline"
                >
                  Save
                </Button>
                <Button
                  onClick={() => {
                    setIsEditingUsername(false);
                    setNewUsername('');
                  }}
                  variant="ghost"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <>
                <Input
                  id="username"
                  name="username"
                  value={profile.username}
                  disabled
                  className="mt-1 bg-muted"
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-muted-foreground">
                    Current username: @{profile.username}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditingUsername(true);
                      setNewUsername(profile.username);
                    }}
                  >
                    Change
                  </Button>
                </div>
              </>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              value={profile.email}
              disabled
              className="mt-1 bg-muted"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Go to Account settings to change email
            </p>
          </div>

          <Button
            onClick={handleSave}
            className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
