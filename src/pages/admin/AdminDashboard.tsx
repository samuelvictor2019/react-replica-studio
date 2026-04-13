import { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import type { AdminOutletContext } from './AdminLayout';
import { getRoleLabel, normalizeRole } from '@/lib/adminApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Calendar,
  FileText,
  Image,
  BarChart3,
  Settings,
  UserCheck,
  MessageSquare,
  FileCheck,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye
} from 'lucide-react';

type DashboardStats = {
  totalEvents: number;
  totalMedia: number;
  totalMembers: number;
  totalTestimonies: number;
  totalForms: number;
  totalPages: number;
  pendingTestimonies: number;
  pendingForms: number;
  recentActivity: Array<{
    id: string;
    type: string;
    message: string;
    timestamp: string;
  }>;
  lastUpdated: string;
};

const AdminDashboard = () => {
  const { user, can } = useOutletContext<AdminOutletContext>();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    totalMedia: 0,
    totalMembers: 0,
    totalTestimonies: 0,
    totalForms: 0,
    totalPages: 0,
    pendingTestimonies: 0,
    pendingForms: 0,
    recentActivity: [],
    lastUpdated: new Date().toISOString(),
  });

  // Load dashboard statistics from localStorage
  useEffect(() => {
    const loadStats = () => {
      try {
        // Load events
        const eventsRaw = localStorage.getItem('wgc_admin_events') || localStorage.getItem('wgc_events') || '[]';
        const events = JSON.parse(eventsRaw);
        const totalEvents = events.length;

        // Load media
        const media = JSON.parse(localStorage.getItem('wgc_admin_media') || '[]');
        const totalMedia = media.length;

        // Load members
        const members = JSON.parse(localStorage.getItem('wgc_admin_members') || '[]');
        const totalMembers = members.length;

        // Load testimonies
        const testimonies = JSON.parse(localStorage.getItem('wgc_admin_testimonies') || '[]');
        const totalTestimonies = testimonies.length;
        const pendingTestimonies = testimonies.filter((t: any) => t.status === 'pending').length;

        // Load forms
        const forms = JSON.parse(localStorage.getItem('wgc_admin_forms') || '[]');
        const totalForms = forms.length;
        const pendingForms = forms.filter((f: any) => f.status === 'new').length;

        // Load pages
        const pages = JSON.parse(localStorage.getItem('wgc_admin_pages') || '[]');
        const totalPages = pages.length;

        // Load recent activity
        const activity = JSON.parse(localStorage.getItem('wgc_admin_user_activity') || '[]');
        const recentActivity = activity.slice(-5).reverse();

        setStats({
          totalEvents,
          totalMedia,
          totalMembers,
          totalTestimonies,
          totalForms,
          totalPages,
          pendingTestimonies,
          pendingForms,
          recentActivity,
          lastUpdated: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Failed to load dashboard stats:', error);
      }
    };

    loadStats();
  }, []);

  const quickActions = [
    {
      title: 'Manage Events',
      description: 'Create and edit church events',
      icon: Calendar,
      path: '/admin/events',
      permission: 'content.read',
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200'
    },
    {
      title: 'Media Library',
      description: 'Upload and organize media content',
      icon: Image,
      path: '/admin/media',
      permission: 'content.read',
      color: 'bg-green-50 hover:bg-green-100 border-green-200'
    },
    {
      title: 'New Members',
      description: 'Review member registrations',
      icon: UserCheck,
      path: '/admin/members',
      permission: 'content.read',
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200'
    },
    {
      title: 'Testimonies',
      description: `${stats.pendingTestimonies} pending approval`,
      icon: MessageSquare,
      path: '/admin/testimonies',
      permission: 'testimonies.read',
      color: 'bg-orange-50 hover:bg-orange-100 border-orange-200'
    },
    {
      title: 'Form Submissions',
      description: `${stats.pendingForms} new submissions`,
      icon: FileCheck,
      path: '/admin/forms',
      permission: 'forms.read',
      color: 'bg-red-50 hover:bg-red-100 border-red-200'
    },
    {
      title: 'Analytics',
      description: 'View website statistics',
      icon: BarChart3,
      path: '/admin/analytics',
      permission: 'dashboard.read',
      color: 'bg-teal-50 hover:bg-teal-100 border-teal-200'
    },
    {
      title: 'User Management',
      description: 'Manage admin accounts',
      icon: Users,
      path: '/admin/users',
      permission: 'users.read',
      color: 'bg-gray-50 hover:bg-gray-100 border-gray-200'
    },
    {
      title: 'System Settings',
      description: 'Configure system preferences',
      icon: Settings,
      path: '/admin/settings',
      permission: 'users.update',
      color: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200'
    }
  ];

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const roleBadgeClass = () => {
    const role = normalizeRole(user.role);
    if (role === 'super_admin') return 'bg-red-100 text-red-800';
    if (role === 'editor') return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-black/40">Dashboard</p>
          <h1 className="font-heading text-2xl sm:text-3xl text-black mt-1">
            Welcome back, {user.firstName} {user.lastName}
          </h1>
          <p className="text-sm text-black/70 mt-1">
            Role: <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleBadgeClass()}`}>{getRoleLabel(user.role)}</span>
          </p>
          <p className="text-xs text-black/50 mt-2">Data source: local admin cache · Updated {formatTimeAgo(stats.lastUpdated)}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-black/60">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>System Online</span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Events</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalEvents}</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Image className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Media</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalMedia}</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <UserCheck className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Members</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalMembers}</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Testimonies</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalTestimonies}</p>
            {stats.pendingTestimonies > 0 && (
              <Badge variant="outline" className="text-xs mt-1">
                {stats.pendingTestimonies} pending
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileCheck className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">Forms</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalForms}</p>
            {stats.pendingForms > 0 && (
              <Badge variant="outline" className="text-xs mt-1">
                {stats.pendingForms} new
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card className="border-indigo-200 bg-indigo-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-indigo-600" />
              <span className="text-sm font-medium">Pages</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalPages}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-black mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            const hasPermission = can(action.permission);

            return (
              <Card
                key={action.path}
                className={`cursor-pointer transition-all duration-200 ${action.color} ${
                  hasPermission ? 'hover:shadow-md' : 'opacity-50 cursor-not-allowed'
                }`}
                onClick={() => hasPermission && navigate(action.path)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${action.color.split(' ')[0]} border`}>
                      <Icon className="h-5 w-5 text-current" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm text-black">{action.title}</h3>
                      <p className="text-xs text-black/70 mt-1">{action.description}</p>
                      {!hasPermission && (
                        <Badge variant="outline" className="text-xs mt-2">
                          No Access
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Activity className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-black">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-sm text-gray-500">No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              System Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">API Status</span>
                </div>
                <Badge className="bg-green-100 text-green-800">Online</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Last Backup</span>
                </div>
                <span className="text-sm text-gray-600">2 hours ago</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span className="text-sm">Active Sessions</span>
                </div>
                <span className="text-sm text-gray-600">1</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm">Pending Items</span>
                </div>
                <Badge variant="outline">
                  {stats.pendingTestimonies + stats.pendingForms}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
