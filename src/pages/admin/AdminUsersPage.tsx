import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { AdminOutletContext } from './AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Users, Shield, UserPlus, Edit, Trash2, Key, Activity, Search, Filter, MoreHorizontal, Eye, Ban, CheckCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { adminRequest, getRoleLabel, normalizeRole } from '@/lib/adminApi';

type User = {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'super_admin' | 'editor' | 'viewer';
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  loginAttempts?: number;
  lastLoginAttempt?: string;
  passwordResetRequired?: boolean;
  twoFactorEnabled?: boolean;
};

type UserActivity = {
  id: string;
  userId: string;
  action: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
};



const AdminUsersPage = () => {
  const { can } = useOutletContext<AdminOutletContext>();
  const canManageUsers = can('users.update');
  const [users, setUsers] = useState<User[]>([]);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userFormData, setUserFormData] = useState({
    username: '',
    email: '',
    role: 'viewer' as 'super_admin' | 'editor' | 'viewer',
    status: 'active' as 'active' | 'inactive' | 'suspended',
    passwordResetRequired: false,
    twoFactorEnabled: false
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, activitiesRes] = await Promise.all([
        adminRequest<{ data: User[] }>('/auth/users?page=1&limit=10'),
        adminRequest<{ data: UserActivity[] }>('/activities').catch(() => ({ data: [] }))
      ]);
      const usersArray = Array.isArray(usersRes) ? usersRes : Array.isArray(usersRes.data) ? usersRes.data : [];
      setUsers(usersArray);
      setActivities(activitiesRes.data || []);
      setError('');
    } catch (error) {
      console.warn('Failed to load users data:', error);
      setError('Failed to load users data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetUserForm = () => {
    setUserFormData({
      username: '',
      email: '',
      role: 'viewer',
      status: 'active',
      passwordResetRequired: false,
      twoFactorEnabled: false
    });
    setEditingUser(null);
  };

  const openUserCreateDialog = () => {
    if (!canManageUsers) return;
    resetUserForm();
    setIsUserDialogOpen(true);
  };

  const openUserEditDialog = (user: User) => {
    if (!canManageUsers) return;
    setUserFormData({
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      passwordResetRequired: user.passwordResetRequired || false,
      twoFactorEnabled: user.twoFactorEnabled || false
    });
    setEditingUser(user);
    setIsUserDialogOpen(true);
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageUsers) return;

    try {
      if (editingUser) {
        await adminRequest(`/auth/users/${editingUser.id}`, {
          method: 'PATCH',
          body: JSON.stringify(userFormData)
        });
      } else {
        await adminRequest('/auth/users', {
          method: 'POST',
          body: JSON.stringify(userFormData)
        });
      }
      setIsUserDialogOpen(false);
      resetUserForm();
      loadData();
    } catch (e: any) {
      console.warn('Failed to save user:', e.message);
      alert(e.message || 'Failed to save user');
    }
  };

  const handleUserDelete = async (id: string) => {
    if (!canManageUsers) return;
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      await adminRequest(`/users/${id}`, { method: 'DELETE' });
      loadData();
    } catch (e: any) {
      console.warn('Failed to delete user:', e.message);
      alert(e.message || 'Failed to delete user');
    }
  };

  const handleUserStatusChange = async (id: string, newStatus: 'active' | 'inactive' | 'suspended') => {
    if (!canManageUsers) return;
    try {
      await adminRequest(`/auth/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      loadData();
    } catch (e: any) {
      console.warn('Failed to change status:', e.message);
      alert(e.message || 'Failed to change user status');
    }
  };

  const handlePasswordReset = async (id: string) => {
    if (!canManageUsers) return;
    try {
      await adminRequest(`/auth/users/${id}/password-reset`, { method: 'POST' });
      loadData();
      alert('Password reset has been initiated for this user.');
    } catch (e: any) {
      console.warn('Failed to reset password:', e.message);
      alert(e.message || 'Failed to initiate password reset');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || normalizeRole(user.role) === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleDotColor = (role: string) => {
    switch (normalizeRole(role)) {
      case 'super_admin': return 'bg-red-500';
      case 'editor': return 'bg-blue-500';
      case 'viewer': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-red-500';
      case 'suspended': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const userStats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    inactive: users.filter(u => u.status === 'inactive').length,
    suspended: users.filter(u => u.status === 'suspended').length,
    admins: users.filter(u => normalizeRole(u.role) === 'super_admin').length,
    editors: users.filter(u => u.role === 'editor').length
  };

  if (!can('users.read')) {
    return <p className="text-sm text-red-600">Access denied</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-medium">User Management</p>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mt-1">Users & Roles</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage administrator accounts and permissions</p>
        </div>
      </div>

      {/* User Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Total Users</span>
            </div>
            <p className="text-2xl font-bold">{userStats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Active</span>
            </div>
            <p className="text-2xl font-bold">{userStats.active}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Ban className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">Inactive</span>
            </div>
            <p className="text-2xl font-bold">{userStats.inactive}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">Super Admins</span>
            </div>
            <p className="text-2xl font-bold">{userStats.admins}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Edit className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Editors</span>
            </div>
            <p className="text-2xl font-bold">{userStats.editors}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-auto">
          <TabsTrigger value="users" className="text-sm">User Management</TabsTrigger>
          <TabsTrigger value="activity" className="text-sm">Activity Log</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {canManageUsers && (
              <Button onClick={openUserCreateDialog} className="w-full sm:w-auto">
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            )}
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Login Attempts</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="font-medium">{user.username}</div>
                        {user.passwordResetRequired && (
                          <Badge variant="outline" className="text-xs mt-1">
                            Password Reset Required
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-1.5 capitalize font-medium px-2 py-0.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${getRoleDotColor(user.role)}`}></span>
                          {getRoleLabel(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-1.5 capitalize font-medium px-2 py-0.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor(user.status)}`}></span>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {user.loginAttempts || 0}
                      </TableCell>
                      <TableCell>
                        {canManageUsers ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openUserEditDialog(user)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handlePasswordReset(user.id)}>
                                <Key className="w-4 h-4 mr-2" />
                                Reset Password
                              </DropdownMenuItem>
                              {user.status === 'active' && (
                                <DropdownMenuItem onClick={() => handleUserStatusChange(user.id, 'suspended')}>
                                  <Ban className="w-4 h-4 mr-2" />
                                  Suspend
                                </DropdownMenuItem>
                              )}
                              {user.status === 'suspended' && (
                                <DropdownMenuItem onClick={() => handleUserStatusChange(user.id, 'active')}>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Activate
                                </DropdownMenuItem>
                              )}
                              {user.id !== '1' && (
                                <DropdownMenuItem onClick={() => handleUserDelete(user.id)} className="text-red-600">
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete User
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <span className="text-xs text-gray-400">Read only</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                User Activity Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.slice(0, 50).map((activity) => {
                  const user = users.find(u => u.id === activity.userId);
                  return (
                    <div key={activity.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Activity className="w-4 h-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{user?.username || 'Unknown User'}</span>
                          <Badge variant="outline" className="text-xs">
                            {activity.action.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{activity.details}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{new Date(activity.timestamp).toLocaleString()}</span>
                          {activity.ipAddress && <span>IP: {activity.ipAddress}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {activities.length === 0 && (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-sm text-gray-500">No activity recorded yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit User Dialog */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUserSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Username</label>
              <Input
                value={userFormData.username}
                onChange={(e) => setUserFormData(prev => ({ ...prev, username: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={userFormData.email}
                onChange={(e) => setUserFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Role</label>
                <Select
                  value={userFormData.role}
                  onValueChange={(value: 'super_admin' | 'editor' | 'viewer') =>
                    setUserFormData(prev => ({ ...prev, role: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={userFormData.status}
                  onValueChange={(value: 'active' | 'inactive' | 'suspended') =>
                    setUserFormData(prev => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Password Reset Required</label>
                  <p className="text-xs text-gray-500">Force user to reset password on next login</p>
                </div>
                <Switch
                  checked={userFormData.passwordResetRequired}
                  onCheckedChange={(checked) => setUserFormData(prev => ({ ...prev, passwordResetRequired: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Two-Factor Authentication</label>
                  <p className="text-xs text-gray-500">Enable 2FA for this user</p>
                </div>
                <Switch
                  checked={userFormData.twoFactorEnabled}
                  onCheckedChange={(checked) => setUserFormData(prev => ({ ...prev, twoFactorEnabled: checked }))}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsUserDialogOpen(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
                {editingUser ? 'Update User' : 'Add User'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsersPage;
