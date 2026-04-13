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
import { getRoleLabel, normalizeRole } from '@/lib/adminApi';

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

const USERS_STORAGE_KEY = 'wgc_admin_users';
const ACTIVITY_STORAGE_KEY = 'wgc_admin_user_activity';

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

  // Load data from localStorage on component mount
  useEffect(() => {
    // Load users
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (storedUsers) {
      try {
        setUsers(JSON.parse(storedUsers));
      } catch (error) {
        console.error('Failed to load users from storage:', error);
      }
    } else {
      // Initialize with default admin user
      const defaultUsers: User[] = [{
        id: '1',
        username: 'admin',
        email: 'admin@wgc.com',
        role: 'super_admin',
        status: 'active',
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        loginAttempts: 0,
        passwordResetRequired: false,
        twoFactorEnabled: false
      }];
      setUsers(defaultUsers);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultUsers));
    }

    // Load activities
    const storedActivities = localStorage.getItem(ACTIVITY_STORAGE_KEY);
    if (storedActivities) {
      try {
        setActivities(JSON.parse(storedActivities));
      } catch (error) {
        console.error('Failed to load activities from storage:', error);
      }
    } else {
      // Initialize with some sample activities
      const defaultActivities: UserActivity[] = [{
        id: '1',
        userId: '1',
        action: 'login',
        details: 'Successful login',
        timestamp: new Date().toISOString(),
        ipAddress: '192.168.1.1'
      }];
      setActivities(defaultActivities);
      localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(defaultActivities));
    }
  }, []);

  // Save users to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  // Save activities to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(activities));
  }, [activities]);

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

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageUsers) return;
    const now = new Date().toISOString();

    if (editingUser) {
      // Update existing user
      setUsers(prev => prev.map(user =>
        user.id === editingUser.id
          ? { ...user, ...userFormData, updatedAt: now }
          : user
      ));

      // Log activity
      const activity: UserActivity = {
        id: Date.now().toString(),
        userId: editingUser.id,
        action: 'profile_update',
        details: `Profile updated by admin`,
        timestamp: now
      };
      setActivities(prev => [activity, ...prev]);
    } else {
      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        ...userFormData,
        createdAt: now,
        updatedAt: now,
        loginAttempts: 0
      };
      setUsers(prev => [...prev, newUser]);

      // Log activity
      const activity: UserActivity = {
        id: Date.now().toString(),
        userId: newUser.id,
        action: 'user_created',
        details: `New user account created`,
        timestamp: now
      };
      setActivities(prev => [activity, ...prev]);
    }

    setIsUserDialogOpen(false);
    resetUserForm();
  };

  const handleUserDelete = (id: string) => {
    if (!canManageUsers) return;
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    const user = users.find(u => u.id === id);
    setUsers(prev => prev.filter(user => user.id !== id));

    // Log activity
    const activity: UserActivity = {
      id: Date.now().toString(),
      userId: id,
      action: 'user_deleted',
      details: `User account deleted: ${user?.username}`,
      timestamp: new Date().toISOString()
    };
    setActivities(prev => [activity, ...prev]);
  };

  const handleUserStatusChange = (id: string, newStatus: 'active' | 'inactive' | 'suspended') => {
    if (!canManageUsers) return;
    setUsers(prev => prev.map(user =>
      user.id === id
        ? { ...user, status: newStatus, updatedAt: new Date().toISOString() }
        : user
    ));

    // Log activity
    const activity: UserActivity = {
      id: Date.now().toString(),
      userId: id,
      action: 'status_change',
      details: `Status changed to ${newStatus}`,
      timestamp: new Date().toISOString()
    };
    setActivities(prev => [activity, ...prev]);
  };

  const handlePasswordReset = (id: string) => {
    if (!canManageUsers) return;
    setUsers(prev => prev.map(user =>
      user.id === id
        ? { ...user, passwordResetRequired: true, updatedAt: new Date().toISOString() }
        : user
    ));

    // Log activity
    const activity: UserActivity = {
      id: Date.now().toString(),
      userId: id,
      action: 'password_reset_required',
      details: 'Password reset required flag set',
      timestamp: new Date().toISOString()
    };
    setActivities(prev => [activity, ...prev]);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || normalizeRole(user.role) === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role: string) => {
    switch (normalizeRole(role)) {
      case 'super_admin': return 'bg-red-100 text-red-800';
      case 'editor': return 'bg-blue-100 text-blue-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'suspended': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
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
          <p className="text-xs uppercase tracking-[0.16em] text-black/40">User Management</p>
          <h1 className="font-heading text-2xl sm:text-3xl text-black mt-1">Users & Roles</h1>
          <p className="text-sm text-black/70 mt-1">Manage administrator accounts and permissions</p>
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
              <Button onClick={openUserCreateDialog} className="bg-green-600 hover:bg-green-700">
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
                        <Badge className={getRoleColor(user.role)}>
                          {getRoleLabel(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(user.status)}>
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
              <Button type="submit" className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
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
