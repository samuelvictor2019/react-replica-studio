import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { AdminOutletContext } from './AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Settings, Database, Globe, Lock, Save, Loader2 } from 'lucide-react';
import { adminRequest, describeApiError } from '@/lib/adminApi';
import { toast } from '@/components/ui/sonner';
import AdminPageSkeleton from '@/components/admin/AdminPageSkeleton';

type SystemSettings = {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  defaultUserRole: 'viewer' | 'editor';
  emailNotifications: boolean;
  smtpConfigured: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  maxFileSize: number;
  sessionTimeoutMinutes: number;
  require2FAForPrivilegedUsers: boolean;
  enforceStrongPasswords: boolean;
  updatedAt: string;
};


const getDefaultSettings = (): SystemSettings => ({
  siteName: 'Watergate Church',
  siteDescription: 'We are a Christ-centered community of Saints',
  contactEmail: 'info@wgc.com',
  maintenanceMode: false,
  allowRegistration: true,
  defaultUserRole: 'viewer',
  emailNotifications: true,
  smtpConfigured: false,
  backupFrequency: 'weekly',
  maxFileSize: 10,
  sessionTimeoutMinutes: 60,
  require2FAForPrivilegedUsers: true,
  enforceStrongPasswords: true,
  updatedAt: new Date().toISOString(),
});

const AdminSettingsPage = () => {
  const { can } = useOutletContext<AdminOutletContext>();
  const [settings, setSettings] = useState<SystemSettings>(getDefaultSettings());
  const [saveMessage, setSaveMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await adminRequest<{ data: SystemSettings }>('/settings');
      if (res.data) {
        setSettings({ ...getDefaultSettings(), ...res.data });
      }
    } catch (e: any) {
      console.warn('Failed to load settings:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    const updated = {
      ...settings,
      updatedAt: new Date().toISOString(),
    };
    
    setSaving(true);
    try {
      await adminRequest('/settings', {
        method: 'PATCH',
        body: JSON.stringify(updated)
      });
      setSettings(updated);
      setSaveMessage('System settings saved successfully.');
      toast.success('System settings saved successfully.');
      setTimeout(() => setSaveMessage(''), 2500);
    } catch (e: any) {
      console.warn('Failed to save settings:', e.message);
      const msg = describeApiError(e, 'Failed to save settings');
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (!can('users.update')) {
    return <p className="text-sm text-red-600">Access denied</p>;
  }

  if (loading) {
    return <AdminPageSkeleton label="settings" variant="settings" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-medium">Settings</p>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mt-1">System Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure platform behavior, security defaults, and operational controls</p>
          {saveMessage && (
            <p className="text-sm text-green-700 mt-2">{saveMessage}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Maintenance</span>
            </div>
            <p className="text-2xl font-bold">{settings.maintenanceMode ? 'ON' : 'OFF'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Registration</span>
            </div>
            <p className="text-2xl font-bold">{settings.allowRegistration ? 'OPEN' : 'CLOSED'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Database className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Backups</span>
            </div>
            <p className="text-2xl font-bold capitalize">{settings.backupFrequency}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">Session Timeout</span>
            </div>
            <p className="text-2xl font-bold">{settings.sessionTimeoutMinutes}m</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Platform Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-black/80">General</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Site Name</label>
                  <Input
                    value={settings.siteName}
                    onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Contact Email</label>
                  <Input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => setSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Site Description</label>
                <Textarea
                  value={settings.siteDescription}
                  onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-black/80">Operations</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Backup Frequency</label>
                  <Select
                    value={settings.backupFrequency}
                    onValueChange={(value: 'daily' | 'weekly' | 'monthly') =>
                      setSettings(prev => ({ ...prev, backupFrequency: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Max Upload Size (MB)</label>
                  <Input
                    type="number"
                    value={settings.maxFileSize}
                    onChange={(e) => setSettings(prev => ({ ...prev, maxFileSize: Math.max(1, parseInt(e.target.value) || 10) }))}
                    min="1"
                    max="100"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Default Role for New Users</label>
                  <Select
                    value={settings.defaultUserRole}
                    onValueChange={(value: 'viewer' | 'editor') => setSettings(prev => ({ ...prev, defaultUserRole: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Viewer</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-black/80">Security & Access</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Session Timeout (minutes)</label>
                  <Input
                    type="number"
                    value={settings.sessionTimeoutMinutes}
                    onChange={(e) => setSettings(prev => ({ ...prev, sessionTimeoutMinutes: Math.max(5, parseInt(e.target.value) || 60) }))}
                    min="5"
                    max="480"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Maintenance Mode</label>
                    <p className="text-xs text-gray-500">Temporarily disable public-facing interactions</p>
                  </div>
                  <Switch
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, maintenanceMode: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Allow Registration</label>
                    <p className="text-xs text-gray-500">Allow new users to submit registration forms</p>
                  </div>
                  <Switch
                    checked={settings.allowRegistration}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allowRegistration: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Require 2FA for Privileged Users</label>
                    <p className="text-xs text-gray-500">Enforce two-factor auth for Super Admins and Editors</p>
                  </div>
                  <Switch
                    checked={settings.require2FAForPrivilegedUsers}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, require2FAForPrivilegedUsers: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Enforce Strong Passwords</label>
                    <p className="text-xs text-gray-500">Require stronger password policy for all admin users</p>
                  </div>
                  <Switch
                    checked={settings.enforceStrongPasswords}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enforceStrongPasswords: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Email Notifications</label>
                    <p className="text-xs text-gray-500">Send operational notifications by email</p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailNotifications: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">SMTP Configured</label>
                    <p className="text-xs text-gray-500">Email infrastructure status</p>
                  </div>
                  <Switch
                    checked={settings.smtpConfigured}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, smtpConfigured: checked }))}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-start">
              <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {saving ? 'Saving Settings...' : 'Save Settings'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettingsPage;
