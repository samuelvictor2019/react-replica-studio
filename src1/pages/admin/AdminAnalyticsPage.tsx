import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { AdminOutletContext } from './AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, TrendingUp, Users, Eye, FileText, MessageSquare, Calendar, RefreshCw, Download } from 'lucide-react';
import { adminRequest } from '@/lib/adminApi';

type AnalyticsData = {
  totalPageViews: number;
  uniqueVisitors: number;
  totalSessions: number;
  avgSessionDuration: number;
  bounceRate: number;
  topPages: Array<{ page: string; views: number; percentage: number }>;
  trafficSources: Array<{ source: string; visitors: number; percentage: number }>;
  dailyStats: Array<{ date: string; pageViews: number; visitors: number; sessions: number }>;
  formSubmissions: number;
  eventRegistrations: number;
  newMembers: number;
  lastUpdated: string;
};

const AdminAnalyticsPage = () => {
  const { can } = useOutletContext<AdminOutletContext>();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const data = await adminRequest<AnalyticsData>(`/analytics?range=${timeRange}`);
      setAnalytics(data);
    } catch (err: any) {
      console.error('Failed to load analytics:', err);
      setError(err?.message || 'Failed to load analytics data.');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const handleRefresh = () => {
    fetchAnalytics();
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  if (!can('dashboard.read')) {
    return <p className="text-sm text-red-600">Access denied</p>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  if (!analytics) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-medium">Analytics</p>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mt-1">Website Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Track website performance and user engagement</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>



      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Page Views</span>
            </div>
            <p className="text-2xl font-bold">{formatNumber(analytics.totalPageViews)}</p>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Unique Visitors</span>
            </div>
            <p className="text-2xl font-bold">{formatNumber(analytics.uniqueVisitors)}</p>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +8% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Sessions</span>
            </div>
            <p className="text-2xl font-bold">{formatNumber(analytics.totalSessions)}</p>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +15% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Avg. Session</span>
            </div>
            <p className="text-2xl font-bold">{formatDuration(analytics.avgSessionDuration)}</p>
            <p className="text-xs text-red-600 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 rotate-180" />
              -3% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Form Submissions</span>
            </div>
            <p className="text-2xl font-bold">{formatNumber(analytics.formSubmissions)}</p>
            <p className="text-xs text-gray-500">Last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Event Registrations</span>
            </div>
            <p className="text-2xl font-bold">{formatNumber(analytics.eventRegistrations)}</p>
            <p className="text-xs text-gray-500">Last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">New Members</span>
            </div>
            <p className="text-2xl font-bold">{formatNumber(analytics.newMembers)}</p>
            <p className="text-xs text-gray-500">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Top Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topPages.map((page, index) => (
                <div key={page.page} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500 w-6">#{index + 1}</span>
                    <span className="font-medium">{page.page}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${page.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-12 text-right">{formatNumber(page.views)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Traffic Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.trafficSources.map((source, index) => (
                <div key={source.source} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500 w-6">#{index + 1}</span>
                    <span className="font-medium">{source.source}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${source.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-12 text-right">{formatNumber(source.visitors)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Stats Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Daily Traffic Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-muted rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Interactive Chart</h3>
              <p className="text-sm text-gray-500 max-w-md">
                Chart visualization placeholder. Connect this section to a backend analytics source to show production traffic trends.
              </p>
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{formatNumber(analytics.totalPageViews)}</p>
                  <p className="text-xs text-gray-500">Total Views</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{formatNumber(analytics.uniqueVisitors)}</p>
                  <p className="text-xs text-gray-500">Unique Visitors</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">{analytics.bounceRate}%</p>
                  <p className="text-xs text-gray-500">Bounce Rate</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500">
        Last updated: {new Date(analytics.lastUpdated).toLocaleString()}
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
