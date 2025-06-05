
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Star, TrendingUp } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const Analytics = () => {
  // Mock analytics data - in real implementation, this would come from Supabase
  const stats = [
    {
      title: "Total Users",
      value: "1,247",
      change: "+12%",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Job Requests",
      value: "356",
      change: "+8%",
      icon: FileText,
      color: "text-green-600"
    },
    {
      title: "Average Rating",
      value: "4.8",
      change: "+0.2",
      icon: Star,
      color: "text-yellow-600"
    },
    {
      title: "Growth Rate",
      value: "23%",
      change: "+5%",
      icon: TrendingUp,
      color: "text-purple-600"
    }
  ];

  // Mock data for charts
  const userRegistrationData = [
    { month: 'Jan', users: 65 },
    { month: 'Feb', users: 78 },
    { month: 'Mar', users: 95 },
    { month: 'Apr', users: 112 },
    { month: 'May', users: 134 },
    { month: 'Jun', users: 156 }
  ];

  const jobCategoriesData = [
    { category: 'Plumbing', count: 89, fill: '#3b82f6' },
    { category: 'Electrical', count: 76, fill: '#10b981' },
    { category: 'Carpentry', count: 64, fill: '#f59e0b' },
    { category: 'Painting', count: 52, fill: '#ef4444' },
    { category: 'Gardening', count: 41, fill: '#8b5cf6' },
    { category: 'Other', count: 34, fill: '#6b7280' }
  ];

  const activityData = [
    { day: 'Mon', activeUsers: 245, jobsCompleted: 18 },
    { day: 'Tue', activeUsers: 267, jobsCompleted: 22 },
    { day: 'Wed', activeUsers: 298, jobsCompleted: 25 },
    { day: 'Thu', activeUsers: 312, jobsCompleted: 28 },
    { day: 'Fri', activeUsers: 289, jobsCompleted: 24 },
    { day: 'Sat', activeUsers: 198, jobsCompleted: 15 },
    { day: 'Sun', activeUsers: 176, jobsCompleted: 12 }
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
              <BarChart data={userRegistrationData}>
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
                  data={jobCategoriesData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  label={({ category, count }) => `${category}: ${count}`}
                >
                  {jobCategoriesData.map((entry, index) => (
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
            <LineChart data={activityData}>
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
