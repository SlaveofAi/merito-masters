
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, FileText, Star, TrendingUp } from "lucide-react";

const Analytics = () => {
  // Mock analytics data
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

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Registration Trends</CardTitle>
            <CardDescription>Monthly user growth over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Chart placeholder</p>
                <p className="text-sm text-gray-400">Integration with charts library needed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Job Categories Distribution</CardTitle>
            <CardDescription>Most popular service categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Chart placeholder</p>
                <p className="text-sm text-gray-400">Integration with charts library needed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Platform Activity</CardTitle>
          <CardDescription>Daily active users and job completions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Chart placeholder</p>
              <p className="text-sm text-gray-400">Integration with charts library needed</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
