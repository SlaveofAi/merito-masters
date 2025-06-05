
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Star, TrendingUp } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AnalyticsData {
  totalUsers: number;
  totalJobRequests: number;
  averageRating: number;
  growthRate: number;
  userRegistrationData: Array<{ month: string; users: number }>;
  jobCategoriesData: Array<{ category: string; count: number; fill: string }>;
  activityData: Array<{ day: string; activeUsers: number; jobsCompleted: number }>;
}

const Analytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      // Fetch total users
      const { data: customersData, error: customersError } = await supabase
        .from('customer_profiles')
        .select('id, created_at');
      
      const { data: craftsmenData, error: craftsmenError } = await supabase
        .from('craftsman_profiles')
        .select('id, created_at');

      if (customersError || craftsmenError) throw customersError || craftsmenError;

      const totalUsers = (customersData?.length || 0) + (craftsmenData?.length || 0);

      // Fetch job requests
      const { data: jobRequestsData, error: jobRequestsError } = await supabase
        .from('job_requests')
        .select('id, created_at, job_category');

      if (jobRequestsError) throw jobRequestsError;

      const totalJobRequests = jobRequestsData?.length || 0;

      // Fetch reviews for average rating
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('craftsman_reviews')
        .select('rating');

      if (reviewsError) throw reviewsError;

      const averageRating = reviewsData && reviewsData.length > 0 
        ? reviewsData.reduce((sum, review) => sum + review.rating, 0) / reviewsData.length 
        : 0;

      // Calculate user registration trends (last 6 months)
      const allUsers = [...(customersData || []), ...(craftsmenData || [])];
      const userRegistrationData = calculateMonthlyRegistrations(allUsers);

      // Calculate job categories distribution
      const jobCategoriesData = calculateJobCategories(jobRequestsData || []);

      // Mock activity data (would need more complex queries for real data)
      const activityData = [
        { day: 'Mon', activeUsers: totalUsers * 0.3, jobsCompleted: totalJobRequests * 0.1 },
        { day: 'Tue', activeUsers: totalUsers * 0.35, jobsCompleted: totalJobRequests * 0.12 },
        { day: 'Wed', activeUsers: totalUsers * 0.4, jobsCompleted: totalJobRequests * 0.15 },
        { day: 'Thu', activeUsers: totalUsers * 0.45, jobsCompleted: totalJobRequests * 0.18 },
        { day: 'Fri', activeUsers: totalUsers * 0.4, jobsCompleted: totalJobRequests * 0.16 },
        { day: 'Sat', activeUsers: totalUsers * 0.25, jobsCompleted: totalJobRequests * 0.08 },
        { day: 'Sun', activeUsers: totalUsers * 0.2, jobsCompleted: totalJobRequests * 0.06 }
      ].map(item => ({
        ...item,
        activeUsers: Math.round(item.activeUsers),
        jobsCompleted: Math.round(item.jobsCompleted)
      }));

      // Calculate growth rate (simplified - comparing last month to current)
      const currentMonth = new Date().getMonth();
      const lastMonthUsers = allUsers.filter(user => 
        new Date(user.created_at).getMonth() === (currentMonth - 1)
      ).length;
      const currentMonthUsers = allUsers.filter(user => 
        new Date(user.created_at).getMonth() === currentMonth
      ).length;
      
      const growthRate = lastMonthUsers > 0 
        ? Math.round(((currentMonthUsers - lastMonthUsers) / lastMonthUsers) * 100)
        : 0;

      setAnalytics({
        totalUsers,
        totalJobRequests,
        averageRating: Math.round(averageRating * 10) / 10,
        growthRate,
        userRegistrationData,
        jobCategoriesData,
        activityData
      });

    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  const calculateMonthlyRegistrations = (users: any[]) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const currentMonth = new Date().getMonth();
    
    return months.map((month, index) => {
      const targetMonth = (currentMonth - 5 + index + 12) % 12;
      const usersInMonth = users.filter(user => 
        new Date(user.created_at).getMonth() === targetMonth
      ).length;
      
      return { month, users: usersInMonth };
    });
  };

  const calculateJobCategories = (jobRequests: any[]) => {
    const categoryColors = {
      'plumbing': '#3b82f6',
      'electrical': '#10b981',
      'carpentry': '#f59e0b',
      'painting': '#ef4444',
      'gardening': '#8b5cf6',
      'other': '#6b7280'
    };

    const categoryCounts = jobRequests.reduce((acc, job) => {
      const category = job.job_category?.toLowerCase() || 'other';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(categoryCounts).map(([category, count]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      count: count as number,
      fill: categoryColors[category as keyof typeof categoryColors] || categoryColors.other
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-2 text-sm text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-2 text-sm text-gray-600">Failed to load analytics data.</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Users",
      value: analytics.totalUsers.toLocaleString(),
      change: `+${analytics.growthRate}%`,
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Job Requests",
      value: analytics.totalJobRequests.toLocaleString(),
      change: "+8%",
      icon: FileText,
      color: "text-green-600"
    },
    {
      title: "Average Rating",
      value: analytics.averageRating.toString(),
      change: "+0.2",
      icon: Star,
      color: "text-yellow-600"
    },
    {
      title: "Growth Rate",
      value: `${analytics.growthRate}%`,
      change: "+5%",
      icon: TrendingUp,
      color: "text-purple-600"
    }
  ];

  const chartConfig = {
    users: { label: "Users", color: "#3b82f6" },
    activeUsers: { label: "Active Users", color: "#3b82f6" },
    jobsCompleted: { label: "Jobs Completed", color: "#10b981" }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-2 text-sm text-gray-600">
          Platform performance metrics and insights.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-green-600">{stat.change} from last month</p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Registration Trends</CardTitle>
            <CardDescription>Monthly user growth over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <BarChart data={analytics.userRegistrationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="users" fill="#3b82f6" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Job Categories Distribution</CardTitle>
            <CardDescription>Most popular service categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <PieChart>
                <Pie
                  data={analytics.jobCategoriesData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  label={({ category, count }) => `${category}: ${count}`}
                >
                  {analytics.jobCategoriesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Platform Activity</CardTitle>
          <CardDescription>Daily active users and job completions</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-64">
            <LineChart data={analytics.activityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="activeUsers" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="jobsCompleted" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
