
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, FileText, Calendar, MapPin, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface JobRequest {
  id: string;
  customer_name: string;
  customer_email: string;
  job_category: string;
  location: string;
  description: string;
  status: string;
  created_at: string;
  urgency: string;
  preferred_date?: string;
  responses_count?: number;
}

const JobRequests = () => {
  const [jobRequests, setJobRequests] = useState<JobRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'in_progress' | 'completed' | 'closed'>('all');

  useEffect(() => {
    fetchJobRequests();
  }, []);

  const fetchJobRequests = async () => {
    try {
      setLoading(true);
      
      // Fetch job requests with response counts
      const { data: jobRequestsData, error: jobRequestsError } = await supabase
        .from('job_requests')
        .select(`
          *,
          job_responses(count)
        `)
        .order('created_at', { ascending: false });

      if (jobRequestsError) throw jobRequestsError;

      // Transform the data to include response counts
      const transformedData = jobRequestsData?.map(request => ({
        ...request,
        responses_count: request.job_responses?.[0]?.count || 0
      })) || [];

      setJobRequests(transformedData);
    } catch (error) {
      console.error('Error fetching job requests:', error);
      toast.error('Failed to fetch job requests');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJobRequest = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job request? This action cannot be undone.')) return;

    try {
      // First delete related job responses
      const { error: responsesError } = await supabase
        .from('job_responses')
        .delete()
        .eq('job_request_id', jobId);

      if (responsesError) throw responsesError;

      // Then delete the job request
      const { error: jobError } = await supabase
        .from('job_requests')
        .delete()
        .eq('id', jobId);

      if (jobError) throw jobError;

      toast.success('Job request deleted successfully');
      fetchJobRequests();
    } catch (error) {
      console.error('Error deleting job request:', error);
      toast.error('Failed to delete job request');
    }
  };

  const handleUpdateStatus = async (jobId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('job_requests')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', jobId);

      if (error) throw error;

      toast.success('Job status updated successfully');
      fetchJobRequests();
    } catch (error) {
      console.error('Error updating job status:', error);
      toast.error('Failed to update job status');
    }
  };

  const filteredJobRequests = jobRequests.filter(job => {
    const matchesSearch = job.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.job_category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'default';
      case 'in_progress': return 'secondary';
      case 'completed': return 'outline';
      case 'closed': return 'destructive';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Requests</h1>
          <p className="mt-2 text-sm text-gray-600">Loading job requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Job Requests</h1>
        <p className="mt-2 text-sm text-gray-600">
          Monitor and manage job requests from customers.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{jobRequests.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Open</p>
                <p className="text-2xl font-bold text-gray-900">
                  {jobRequests.filter(j => j.status === 'open').length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {jobRequests.filter(j => j.status === 'in_progress').length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {jobRequests.filter(j => j.status === 'completed').length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
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

      {/* Job Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Job Requests ({filteredJobRequests.length})</CardTitle>
          <CardDescription>
            Manage all job requests on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Urgency</TableHead>
                <TableHead>Responses</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobRequests.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{job.customer_name}</p>
                      <p className="text-sm text-gray-500">{job.customer_email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{job.job_category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {job.location}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(job.status)}>
                      {job.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{job.urgency}</Badge>
                  </TableCell>
                  <TableCell>{job.responses_count || 0}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(job.created_at).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateStatus(job.id, job.status === 'open' ? 'closed' : 'open')}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteJobRequest(job.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredJobRequests.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No job requests found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default JobRequests;
