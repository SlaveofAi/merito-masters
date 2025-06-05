
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

const ContentModeration = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Mock data for content moderation
  const reportedContent = [
    {
      id: '1',
      type: 'review',
      content: 'Inappropriate review content...',
      reporter: 'User123',
      status: 'pending',
      createdAt: '2025-06-01',
      reason: 'Inappropriate language'
    },
    {
      id: '2',
      type: 'portfolio',
      content: 'Suspicious portfolio image',
      reporter: 'User456',
      status: 'approved',
      createdAt: '2025-05-28',
      reason: 'Spam content'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Content Moderation</h1>
        <p className="mt-2 text-sm text-gray-600">
          Review and moderate reported content, reviews, and user submissions.
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
                placeholder="Search reported content..."
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
                variant={filterStatus === 'approved' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('approved')}
              >
                Approved
              </Button>
              <Button
                variant={filterStatus === 'rejected' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('rejected')}
              >
                Rejected
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content List */}
      <div className="space-y-4">
        {reportedContent.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <h3 className="font-medium text-gray-900">{item.type} Report</h3>
                    <Badge 
                      variant={item.status === 'pending' ? 'secondary' : item.status === 'approved' ? 'default' : 'destructive'}
                    >
                      {item.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{item.content}</p>
                  <p className="text-sm text-gray-500">
                    Reported by {item.reporter} • {item.reason} • {item.createdAt}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Review
                  </Button>
                  <Button variant="outline" size="sm">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button variant="outline" size="sm">
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
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

export default ContentModeration;
