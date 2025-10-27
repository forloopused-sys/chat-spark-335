import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Users, Shield, Bell, CheckCircle, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { database } from '@/lib/firebase';
import { ref, onValue, set, push, remove } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ADMIN_EMAIL = 'nadeemmuhammed702@gmail.com';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [userCount, setUserCount] = useState(0);
  const [users, setUsers] = useState<any[]>([]);
  const [notificationData, setNotificationData] = useState({
    message: '',
    videoUrl: '',
    imageUrl: '',
  });
  const [helpLink, setHelpLink] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [editingNotifId, setEditingNotifId] = useState<string | null>(null);
  const [version, setVersion] = useState('1.0.0');
  const [newFeature, setNewFeature] = useState('');
  const [whatsNew, setWhatsNew] = useState<any[]>([]);
  const [editingFeatureId, setEditingFeatureId] = useState<string | null>(null);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  useEffect(() => {
    if (!user || user.email !== ADMIN_EMAIL) {
      navigate('/home');
      return;
    }

    const usersRef = ref(database, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const userList = Object.entries(data).map(([id, userData]: any) => ({
          id,
          ...userData,
        }));
        setUsers(userList);
        setUserCount(userList.length);
      }
    });

    const settingsRef = ref(database, 'settings/helpLink');
    onValue(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        setHelpLink(snapshot.val());
      }
    });

    const notificationsRef = ref(database, 'notifications');
    const notifUnsubscribe = onValue(notificationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const notifList = Object.entries(data).map(([id, notif]: any) => ({
          id,
          ...notif,
        }));
        setNotifications(notifList.sort((a, b) => b.timestamp - a.timestamp));
      } else {
        setNotifications([]);
      }
    });

    const versionRef = ref(database, 'settings/version');
    onValue(versionRef, (snapshot) => {
      if (snapshot.exists()) {
        setVersion(snapshot.val());
      }
    });

    const whatsNewRef = ref(database, 'settings/whatsNew');
    onValue(whatsNewRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const featuresList = Object.entries(data).map(([id, feature]: any) => ({
          id,
          ...feature,
        }));
        setWhatsNew(featuresList.sort((a, b) => b.timestamp - a.timestamp));
      } else {
        setWhatsNew([]);
      }
    });

    const maintenanceRef = ref(database, 'settings/maintenance');
    onValue(maintenanceRef, (snapshot) => {
      if (snapshot.exists()) {
        setMaintenanceMode(snapshot.val());
      }
    });

    return () => {
      unsubscribe();
      notifUnsubscribe();
    };
  }, [user, navigate]);

  const toggleBlockUser = async (userId: string, currentStatus: boolean) => {
    const userRef = ref(database, `users/${userId}/blocked`);
    await set(userRef, !currentStatus);
    toast({
      title: !currentStatus ? 'User Blocked' : 'User Unblocked',
      description: !currentStatus ? 'User has been blocked' : 'User has been unblocked',
    });
  };

  const toggleVerifyUser = async (userId: string, currentStatus: boolean) => {
    const userRef = ref(database, `users/${userId}/verified`);
    await set(userRef, !currentStatus);
    toast({
      title: !currentStatus ? 'User Verified' : 'Verification Removed',
      description: !currentStatus ? 'User has been verified' : 'Verification has been removed',
    });
  };

  const sendNotification = async () => {
    if (!notificationData.message) {
      toast({
        title: 'Error',
        description: 'Message is required',
        variant: 'destructive',
      });
      return;
    }

    if (editingNotifId) {
      const notifRef = ref(database, `notifications/${editingNotifId}`);
      await set(notifRef, {
        ...notificationData,
        timestamp: Date.now(),
        from: 'admin',
      });
      setEditingNotifId(null);
      toast({
        title: 'Notification Updated',
        description: 'Notification has been updated',
      });
    } else {
      const notificationsRef = ref(database, 'notifications');
      await push(notificationsRef, {
        ...notificationData,
        timestamp: Date.now(),
        from: 'admin',
      });
      toast({
        title: 'Notification Sent',
        description: 'Notification has been sent to all users',
      });
    }

    setNotificationData({ message: '', videoUrl: '', imageUrl: '' });
  };

  const deleteNotification = async (notifId: string) => {
    const notifRef = ref(database, `notifications/${notifId}`);
    await remove(notifRef);
    toast({
      title: 'Notification Deleted',
      description: 'Notification has been removed',
    });
  };

  const editNotification = (notif: any) => {
    setNotificationData({
      message: notif.message,
      videoUrl: notif.videoUrl || '',
      imageUrl: notif.imageUrl || '',
    });
    setEditingNotifId(notif.id);
  };

  const updateHelpLink = async () => {
    const settingsRef = ref(database, 'settings/helpLink');
    await set(settingsRef, helpLink);
    toast({
      title: 'Help Link Updated',
      description: 'Help link has been updated',
    });
  };

  const updateVersion = async () => {
    const versionRef = ref(database, 'settings/version');
    await set(versionRef, version);
    toast({
      title: 'Version Updated',
      description: `App version set to ${version}`,
    });
  };

  const addFeature = async () => {
    if (!newFeature.trim()) {
      toast({
        title: 'Error',
        description: 'Feature description is required',
        variant: 'destructive',
      });
      return;
    }

    if (editingFeatureId) {
      const featureRef = ref(database, `settings/whatsNew/${editingFeatureId}`);
      await set(featureRef, {
        text: newFeature,
        timestamp: Date.now(),
      });
      setEditingFeatureId(null);
      toast({
        title: 'Feature Updated',
        description: 'Feature has been updated',
      });
    } else {
      const whatsNewRef = ref(database, 'settings/whatsNew');
      await push(whatsNewRef, {
        text: newFeature,
        timestamp: Date.now(),
      });
      toast({
        title: 'Feature Added',
        description: 'New feature has been added',
      });
    }
    setNewFeature('');
  };

  const deleteFeature = async (featureId: string) => {
    const featureRef = ref(database, `settings/whatsNew/${featureId}`);
    await remove(featureRef);
    toast({
      title: 'Feature Deleted',
      description: 'Feature has been removed',
    });
  };

  const editFeature = (feature: any) => {
    setNewFeature(feature.text);
    setEditingFeatureId(feature.id);
  };

  const toggleMaintenance = async () => {
    const maintenanceRef = ref(database, 'settings/maintenance');
    await set(maintenanceRef, !maintenanceMode);
    toast({
      title: maintenanceMode ? 'Maintenance Disabled' : 'Maintenance Enabled',
      description: maintenanceMode 
        ? 'App is now accessible to all users'
        : 'App is now in maintenance mode',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <div className="max-w-6xl mx-auto">
        <div className="bg-card border-b border-border p-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/home')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Shield className="w-5 h-5" />
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <Users className="w-8 h-8 text-primary mb-2" />
              <div className="text-3xl font-bold">{userCount}</div>
              <div className="text-sm text-muted-foreground">Total Users</div>
            </div>
          </div>

          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="version">Version</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="mt-4">
              <div className="bg-card border border-border rounded-lg">
                <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
                  {users.map((userData) => (
                    <div key={userData.id} className="p-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold">
                        {userData.username?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold flex items-center gap-2">
                          @{userData.username}
                          {userData.verified && (
                            <CheckCircle className="w-4 h-4 text-primary fill-primary" />
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">{userData.email}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant={userData.verified ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleVerifyUser(userData.id, userData.verified)}
                        >
                          {userData.verified ? 'Verified' : 'Verify'}
                        </Button>
                        <Button
                          variant={userData.blocked ? "destructive" : "outline"}
                          size="sm"
                          onClick={() => toggleBlockUser(userData.id, userData.blocked)}
                        >
                          {userData.blocked ? 'Unblock' : 'Block'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="mt-4">
              <div className="bg-card border border-border rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  {editingNotifId ? 'Edit Notification' : 'Send Notification'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Message *</label>
                    <Textarea
                      value={notificationData.message}
                      onChange={(e) => setNotificationData({ ...notificationData, message: e.target.value })}
                      placeholder="Enter notification message"
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Video URL (Optional)</label>
                    <Input
                      value={notificationData.videoUrl}
                      onChange={(e) => setNotificationData({ ...notificationData, videoUrl: e.target.value })}
                      placeholder="YouTube or Vimeo link"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Image URL (Optional)</label>
                    <Input
                      value={notificationData.imageUrl}
                      onChange={(e) => setNotificationData({ ...notificationData, imageUrl: e.target.value })}
                      placeholder="Image URL"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={sendNotification} className="flex-1">
                      {editingNotifId ? 'Update Notification' : 'Send Notification'}
                    </Button>
                    {editingNotifId && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingNotifId(null);
                          setNotificationData({ message: '', videoUrl: '', imageUrl: '' });
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg">
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold">Sent Notifications</h3>
                </div>
                <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      No notifications sent yet
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div key={notif.id} className="p-4">
                        <p className="font-medium mb-2">{notif.message}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {new Date(notif.timestamp).toLocaleString()}
                          </span>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => editNotification(notif)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteNotification(notif.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="version" className="mt-4">
              <div className="bg-card border border-border rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">App Version</h3>
                <div className="space-y-4">
                  <Input
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder="1.0.0"
                  />
                  <Button onClick={updateVersion} className="w-full">
                    Update Version
                  </Button>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">
                  {editingFeatureId ? 'Edit Feature' : 'Add New Feature'}
                </h3>
                <div className="space-y-4">
                  <Textarea
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Enter new feature description"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button onClick={addFeature} className="flex-1">
                      {editingFeatureId ? 'Update Feature' : 'Add Feature'}
                    </Button>
                    {editingFeatureId && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingFeatureId(null);
                          setNewFeature('');
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg">
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold">What's New Features</h3>
                </div>
                <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
                  {whatsNew.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      No features added yet
                    </div>
                  ) : (
                    whatsNew.map((feature) => (
                      <div key={feature.id} className="p-4">
                        <p className="mb-2">{feature.text}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {new Date(feature.timestamp).toLocaleString()}
                          </span>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => editFeature(feature)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteFeature(feature.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="maintenance" className="mt-4">
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Maintenance Mode</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  When enabled, all users (except admin) will be redirected to a maintenance page.
                </p>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg mb-4">
                  <div>
                    <div className="font-medium">Maintenance Mode</div>
                    <div className="text-sm text-muted-foreground">
                      {maintenanceMode ? 'Currently Active' : 'Currently Inactive'}
                    </div>
                  </div>
                  <Button
                    variant={maintenanceMode ? 'destructive' : 'default'}
                    onClick={toggleMaintenance}
                  >
                    {maintenanceMode ? 'Disable' : 'Enable'}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="mt-4">
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Help Page Link</h3>
                <div className="space-y-4">
                  <Input
                    value={helpLink}
                    onChange={(e) => setHelpLink(e.target.value)}
                    placeholder="Enter help page URL"
                  />
                  <Button onClick={updateHelpLink} className="w-full">
                    Update Help Link
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
