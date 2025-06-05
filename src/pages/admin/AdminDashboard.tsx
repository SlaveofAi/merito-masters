
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, FileText, MessageSquare, TrendingUp } from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  totalCraftsmen: number;
  totalCustomers: number;
  totalJobRequests: number;
  totalReviews: number;
  newUsersThisWeek: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalCraftsmen: 0,
    totalCustomers: 0,
    totalJobRequests: 0,
    totalReviews: 0,
    newUsersThisWeek: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        // Get total craftsmen
        const { count: craftsmenCount } = await supabase
          .from('craftsman_profiles')
          .select('*', { count: 'exact', head: true });

        // Get total customers
        const { count: customersCount } = await supabase
          .from('customer_profiles')
          .select('*', { count: 'exact', head: true });

        // Get total job requests
        const { count: jobRequestsCount } = await supabase
          .from('job_requests')
          .select('*', { count: 'exact', head: true });

        // Get total reviews
        const { count: reviewsCount } = await supabase
          .from('craftsman_reviews')
          .select('*', { count: 'exact', head: true });

        // Get new users this week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const { count: newUsersCount } = await supabase
          .from('user_types')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', oneWeekAgo.toISOString());

        setStats({
          totalUsers: (craftsmenCount || 0) + (customersCount || 0),
          totalCraftsmen: craftsmenCount || 0,
          totalCustomers: customersCount || 0,
          totalJobRequests: jobRequestsCount || 0,
          totalReviews: reviewsCount || 0,
          newUsersThisWeek: newUsersCount || 0,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      description: `${stats.totalCraftsmen} craftsmen, ${stats.totalCustomers} customers`,
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Job Requests",
      value: stats.totalJobRequests,
      description: "Total job requests posted",
      icon: FileText,
      color: "text-green-600",
    },
    {
      title: "Reviews",
      value: stats.totalReviews,
      description: "Total reviews posted",
      icon: MessageSquare,
      color: "text-purple-600",
    },
    {
      title: "New Users This Week",
      value: stats.newUsersThisWeek,
      description: "Users registered in the last 7 days",
      icon: TrendingUp,
      color: "text-orange-600",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Overview of your platform's key metrics and activity.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <CardDescription className="text-xs text-muted-foreground">
                  {stat.description}
                </CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest platform activity and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  Platform running smoothly
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  Admin panel active
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                • Manage users and verification status
              </p>
              <p className="text-sm text-gray-600">
                • Review and moderate content
              </p>
              <p className="text-sm text-gray-600">
                • Monitor job requests and reviews
              </p>
              <p className="text-sm text-gray-600">
                • View platform analytics
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
