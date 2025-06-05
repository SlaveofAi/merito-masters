
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Shield, ShieldCheck, UserX, Edit, MoreHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  user_type: string;
  created_at: string;
  is_verified?: boolean;
  last_active?: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<'all' | 'customer' | 'craftsman' | 'admin'>('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch users from profiles table with user types
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          created_at,
          user_types (user_type)
        `);

      if (profilesError) throw profilesError;

      // Fetch customer profiles for additional info
      const { data: customerData, error: customerError } = await supabase
        .from('customer_profiles')
        .select('id, email');

      if (customerError) throw customerError;

      // Fetch craftsman profiles for additional info
      const { data: craftsmanData, error: craftsmanError } = await supabase
        .from('craftsman_profiles')
        .select('id, email, is_verified');

      if (craftsmanError) throw craftsmanError;

      // Combine the data
      const combinedUsers = profilesData?.map(profile => {
        const customerInfo = customerData?.find(c => c.id === profile.id);
        const craftsmanInfo = craftsmanData?.find(c => c.id === profile.id);
        
        return {
          id: profile.id,
          name: profile.name || 'Unknown',
          email: customerInfo?.email || craftsmanInfo?.email || 'No email',
          user_type: profile.user_types?.[0]?.user_type || 'unknown',
          created_at: profile.created_at,
          is_verified: craftsmanInfo?.is_verified || false,
          last_active: 'Recent' // This would need a separate tracking mechanism
        };
      }) || [];

      setUsers(combinedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyUser = async (userId: string, isVerified: boolean) => {
    try {
      const { error } = await supabase
        .from('craftsman_profiles')
        .update({ 
          is_verified: !isVerified,
          verified_at: !isVerified ? new Date().toISOString() : null
        })
        .eq('id', userId);

      if (error) throw error;

      toast.success(`User ${!isVerified ? 'verified' : 'unverified'} successfully`);
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error updating verification status:', error);
      toast.error('Failed to update verification status');
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return;

    try {
      // In a real implementation, you might want to add a 'deactivated' field
      // For now, we'll just show a toast
      toast.success('User deactivation feature will be implemented');
    } catch (error) {
      console.error('Error deactivating user:', error);
      toast.error('Failed to deactivate user');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || user.user_type === filterType;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="mt-2 text-sm text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage user accounts, verify craftsmen, and monitor platform activity.
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
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterType('all')}
              >
                All Users
              </Button>
              <Button
                variant={filterType === 'customer' ? 'default' : 'outline'}
                onClick={() => setFilterType('customer')}
              >
                Customers
              </Button>
              <Button
                variant={filterType === 'craftsman' ? 'default' : 'outline'}
                onClick={() => setFilterType('craftsman')}
              >
                Craftsmen
              </Button>
              <Button
                variant={filterType === 'admin' ? 'default' : 'outline'}
                onClick={() => setFilterType('admin')}
              >
                Admins
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Manage and monitor all platform users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.user_type === 'admin' ? 'destructive' : 'secondary'}>
                      {user.user_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.user_type === 'craftsman' && (
                      <Badge variant={user.is_verified ? 'default' : 'outline'}>
                        {user.is_verified ? (
                          <>
                            <ShieldCheck className="h-3 w-3 mr-1" />
                            Verified
                          </>
                        ) : (
                          <>
                            <Shield className="h-3 w-3 mr-1" />
                            Unverified
                          </>
                        )}
                      </Badge>
                    )}
                    {user.user_type !== 'craftsman' && (
                      <Badge variant="outline">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {user.user_type === 'craftsman' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVerifyUser(user.id, user.is_verified || false)}
                        >
                          {user.is_verified ? 'Unverify' : 'Verify'}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeactivateUser(user.id)}
                      >
                        <UserX className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
