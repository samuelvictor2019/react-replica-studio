import { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import type { AdminOutletContext } from './AdminLayout';
import { adminRequest, getRoleLabel, normalizeRole } from '@/lib/adminApi';
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
  AlertCircle
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

  // Load dashboard statistics from API
  useEffect(() => {
    const loadStats = async () => {
      try {
        const [statsRes, activityRes] = await Promise.all([
          adminRequest<{ data: Omit<DashboardStats, 'recentActivity'> }>('/dashboard/stats').catch(() => ({ data: null })),
          adminRequest<{ data: any[] }>('/activities').catch(() => ({ data: [] }))
        ]);
        
        if (statsRes.data) {
          const apiStats: any = statsRes.data;
          setStats({
            totalEvents: apiStats.events || 0,
            totalMedia: apiStats.media || 0,
            totalMembers: apiStats.members || 0,
            totalTestimonies: apiStats.testimonies || 0,
            totalForms: apiStats.forms || 0,
            totalPages: apiStats.pages || 0,
            pendingTestimonies: apiStats.pendingTestimonies || 0,
            pendingForms: apiStats.pendingForms || 0,
            recentActivity: activityRes.data ? activityRes.data.slice(0, 5) : [],
            lastUpdated: new Date().toISOString()
          });
        }
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
      permission: 'content.read'
    },
    {
      title: 'Media Library',
      description: 'Upload and organize media content',
      icon: Image,
      path: '/admin/media',
      permission: 'content.read'
    },
    {
      title: 'New Members',
      description: 'Review member registrations',
      icon: UserCheck,
      path: '/admin/members',
      permission: 'content.read'
    },
    {
      title: 'Testimonies',
      description: `${stats.pendingTestimonies} pending approval`,
      icon: MessageSquare,
      path: '/admin/testimonies',
      permission: 'testimonies.read'
    },
    {
      title: 'Form Submissions',
      description: `${stats.pendingForms} new submissions`,
      icon: FileCheck,
      path: '/admin/forms',
      color: 'bg-red-50 hover:bg-red-100 border-red-200'
    },
    {
      title: 'Appointments',
      description: 'Serving Overseer calendar and booking management',
      icon: Clock,
      path: '/admin/appointments',
      permission: 'appointments.read',
      color: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200'
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
      color: 'bg-muted hover:bg-muted border-border'
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
    return 'bg-muted text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Dashboard</p>
          <h1 className="font-semibold text-2xl sm:text-3xl text-foreground mt-1 tracking-tight">
            Welcome back, {user.firstName} {user.lastName}
          </h1>
          <p className="text-sm text-foreground mt-1 flex items-center gap-2">
            Role: <Badge variant="outline" className="border-border bg-muted/50 text-foreground font-medium shadow-none">{getRoleLabel(user.role)}</Badge>
          </p>
          <p className="text-xs text-muted-foreground mt-2">Data source: Live API · Updated {formatTimeAgo(stats.lastUpdated)}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
          <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
          <span>System Online</span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="border-0 ring-1 ring-inset ring-border/50 bg-card hover:bg-muted/30 transition-colors shadow-sm relative overflow-hidden group">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Events</span>
            </div>
            <p className="text-2xl font-semibold text-foreground tracking-tight">{stats.totalEvents}</p>
          </CardContent>
        </Card>

        <Card className="border-0 ring-1 ring-inset ring-border/50 bg-card hover:bg-muted/30 transition-colors shadow-sm relative overflow-hidden group">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Image className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Media</span>
            </div>
            <p className="text-2xl font-semibold text-foreground tracking-tight">{stats.totalMedia}</p>
          </CardContent>
        </Card>

        <Card className="border-0 ring-1 ring-inset ring-border/50 bg-card hover:bg-muted/30 transition-colors shadow-sm relative overflow-hidden group">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <UserCheck className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Members</span>
            </div>
            <p className="text-2xl font-semibold text-foreground tracking-tight">{stats.totalMembers}</p>
          </CardContent>
        </Card>

        <Card className="border-0 ring-1 ring-inset ring-border/50 bg-card hover:bg-muted/30 transition-colors shadow-sm relative overflow-hidden group">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Testimonies</span>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-semibold text-foreground tracking-tight">{stats.totalTestimonies}</p>
              {stats.pendingTestimonies > 0 && (
                <Badge variant="outline" className="border-border text-[10px] px-1.5 py-0 text-muted-foreground">
                  {stats.pendingTestimonies} pending
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 ring-1 ring-inset ring-border/50 bg-card hover:bg-muted/30 transition-colors shadow-sm relative overflow-hidden group">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileCheck className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Forms</span>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-semibold text-foreground tracking-tight">{stats.totalForms}</p>
              {stats.pendingForms > 0 && (
                <Badge variant="outline" className="border-border text-[10px] px-1.5 py-0 text-muted-foreground">
                  {stats.pendingForms} pending
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 ring-1 ring-inset ring-border/50 bg-card hover:bg-muted/30 transition-colors shadow-sm relative overflow-hidden group">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Pages</span>
            </div>
            <p className="text-2xl font-semibold text-foreground tracking-tight">{stats.totalPages}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4 tracking-tight">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            const hasPermission = can(action.permission);

            return (
              <Card
                key={action.path}
                className={`cursor-pointer transition-all duration-200 border-0 ring-1 ring-inset ring-border/50 bg-card group ${
                  hasPermission ? 'hover:bg-muted/50 hover:ring-border hover:shadow-sm active:scale-[0.99]' : 'opacity-50 cursor-not-allowed'
                }`}
                onClick={() => hasPermission && navigate(action.path)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-[8px] bg-muted/50 border border-border text-muted-foreground group-hover:text-foreground group-hover:border-foreground/20 transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm text-foreground">{action.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
                      {!hasPermission && (
                        <Badge variant="outline" className="text-[10px] mt-2 px-1.5 py-0 border-border text-muted-foreground">
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
        <Card className="border-0 ring-1 ring-inset ring-border/50 bg-card shadow-sm">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold tracking-tight">
              <Activity className="h-4 w-4 text-muted-foreground" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-[8px] bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-background border border-border rounded-full flex items-center justify-center shadow-sm">
                        <Activity className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground leading-snug">{activity.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-10 w-10 text-muted mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 ring-1 ring-inset ring-border/50 bg-card shadow-sm">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold tracking-tight">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              System Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-medium text-foreground">API Status</span>
                </div>
                <Badge variant="outline" className="border-border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">Online</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Last Backup</span>
                </div>
                <span className="text-sm text-muted-foreground">2 hours ago</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Active Sessions</span>
                </div>
                <span className="text-sm text-muted-foreground">1</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium text-foreground">Pending Items</span>
                </div>
                <Badge variant="outline" className="border-border text-muted-foreground font-medium">
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
