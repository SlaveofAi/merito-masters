
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Flag, Eye, Trash2, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ReportedContent {
  id: string;
  content_type: string;
  content_id: string;
  reason: string;
  description: string;
  status: string;
  created_at: string;
  reporter_id: string;
  resolved_at?: string;
  resolved_by?: string;
}

const ContentModeration = () => {
  const [reports, setReports] = useState<ReportedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'resolved' | 'dismissed'>('all');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reported_content')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to fetch content reports');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveReport = async (reportId: string, action: 'resolved' | 'dismissed') => {
    try {
      const { error } = await supabase
        .from('reported_content')
        .update({
          status: action,
          resolved_at: new Date().toISOString(),
          resolved_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', reportId);

      if (error) throw error;

      toast.success(`Report ${action} successfully`);
      fetchReports();
    } catch (error) {
      console.error('Error updating report:', error);
      toast.error('Failed to update report');
    }
  };

  const handleDeleteContent = async (reportId: string, contentType: string, contentId: string) => {
    if (!confirm('Are you sure you want to delete this content? This action cannot be undone.')) return;

    try {
      // Delete the actual content based on type
      let deleteError;
      
      switch (contentType) {
        case 'review':
          const { error: reviewError } = await supabase
            .from('craftsman_reviews')
            .delete()
            .eq('id', contentId);
          deleteError = reviewError;
          break;
        case 'job_request':
          const { error: jobError } = await supabase
            .from('job_requests')
            .delete()
            .eq('id', contentId);
          deleteError = jobError;
          break;
        case 'portfolio_image':
          const { error: portfolioError } = await supabase
            .from('portfolio_images')
            .delete()
            .eq('id', contentId);
          deleteError = portfolioError;
          break;
        default:
          throw new Error('Unknown content type');
      }

      if (deleteError) throw deleteError;

      // Mark report as resolved
      await handleResolveReport(reportId, 'resolved');
      
      toast.success('Content deleted successfully');
    } catch (error) {
      console.error('Error deleting content:', error);
      toast.error('Failed to delete content');
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.content_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Moderation</h1>
          <p className="mt-2 text-sm text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Content Moderation</h1>
        <p className="mt-2 text-sm text-gray-600">
          Review and moderate reported content to maintain platform quality.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
              </div>
              <Flag className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reports.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <Eye className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reports.filter(r => r.status === 'resolved').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Dismissed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reports.filter(r => r.status === 'dismissed').length}
                </p>
              </div>
              <Trash2 className="h-8 w-8 text-gray-500" />
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
                placeholder="Search reports..."
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
                All Reports
              </Button>
              <Button
                variant={filterStatus === 'pending' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('pending')}
              >
                Pending
              </Button>
              <Button
                variant={filterStatus === 'resolved' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('resolved')}
              >
                Resolved
              </Button>
              <Button
                variant={filterStatus === 'dismissed' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('dismissed')}
              >
                Dismissed
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Content Reports ({filteredReports.length})</CardTitle>
          <CardDescription>
            Review reported content and take appropriate action
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Content Type</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reported</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <Badge variant="outline">{report.content_type}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{report.reason}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {report.description || 'No description provided'}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        report.status === 'pending' ? 'destructive' :
                        report.status === 'resolved' ? 'default' : 'secondary'
                      }
                    >
                      {report.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(report.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {report.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResolveReport(report.id, 'dismissed')}
                        >
                          Dismiss
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteContent(report.id, report.content_type, report.content_id)}
                        >
                          Delete Content
                        </Button>
                      </div>
                    )}
                    {report.status !== 'pending' && (
                      <Badge variant="outline">
                        {report.status === 'resolved' ? 'Resolved' : 'Dismissed'}
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredReports.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No reports found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentModeration;
