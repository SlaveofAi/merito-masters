
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Calendar, MapPin } from "lucide-react";

const JobRequests = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'in_progress' | 'completed'>('all');

  // Mock data for job requests
  const jobRequests = [
    {
      id: '1',
      title: 'Kitchen Renovation',
      customer: 'John Doe',
      category: 'Plumbing',
      location: 'Bratislava',
      status: 'open',
      createdAt: '2025-06-01',
      responses: 5
    },
    {
      id: '2',
      title: 'Bathroom Repair',
      customer: 'Jane Smith',
      category: 'Electrical',
      location: 'Košice',
      status: 'in_progress',
      createdAt: '2025-05-28',
      responses: 3
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Job Requests</h1>
        <p className="mt-2 text-sm text-gray-600">
          Monitor and manage job requests from customers.
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search job requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
              >
                All Jobs
              </Button>
              <Button
                variant={filterStatus === 'open' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('open')}
              >
                Open
              </Button>
              <Button
                variant={filterStatus === 'in_progress' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('in_progress')}
              >
                In Progress
              </Button>
              <Button
                variant={filterStatus === 'completed' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('completed')}
              >
                Completed
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Requests List */}
      <div className="space-y-4">
        {jobRequests.map((job) => (
          <Card key={job.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <h3 className="font-medium text-gray-900">{job.title}</h3>
                    <Badge 
                      variant={job.status === 'open' ? 'secondary' : job.status === 'in_progress' ? 'default' : 'outline'}
                    >
                      {job.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Customer: {job.customer}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                    <span>Category: {job.category}</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {job.createdAt}
                    </span>
                    <span>{job.responses} responses</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default JobRequests;
