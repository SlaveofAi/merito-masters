
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Search, Shield, ShieldCheck, UserX, Edit } from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  location: string;
  user_type: 'customer' | 'craftsman';
  created_at: string;
  is_verified?: boolean;
  trade_category?: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<'all' | 'customer' | 'craftsman'>('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Get user types first
      const { data: userTypes } = await supabase
        .from('user_types')
        .select('user_id, user_type');

      if (!userTypes) return;

      // Get customer profiles
      const { data: customers } = await supabase
        .from('customer_profiles')
        .select('id, name, email, location, created_at');

      // Get craftsman profiles
      const { data: craftsmen } = await supabase
        .from('craftsman_profiles')
        .select('id, name, email, location, created_at, is_verified, trade_category');

      // Combine data
      const allUsers: User[] = [];

      customers?.forEach(customer => {
        const userType = userTypes.find(ut => ut.user_id === customer.id);
        if (userType) {
          allUsers.push({
            ...customer,
            user_type: 'customer'
          });
        }
      });

      craftsmen?.forEach(craftsman => {
        const userType = userTypes.find(ut => ut.user_id === craftsman.id);
        if (userType) {
          allUsers.push({
            ...craftsman,
            user_type: 'craftsman'
          });
        }
      });

      setUsers(allUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const toggleVerification = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('craftsman_profiles')
        .update({ 
          is_verified: !currentStatus,
          verified_at: !currentStatus ? new Date().toISOString() : null,
          verified_by: !currentStatus ? (await supabase.auth.getUser()).data.user?.id : null
        })
        .eq('id', userId);

      if (error) throw error;

      // Log admin action
      await supabase.rpc('log_admin_action', {
        p_action: !currentStatus ? 'user_verified' : 'user_unverified',
        p_target_type: 'craftsman',
        p_target_id: userId,
        p_details: { previous_status: currentStatus, new_status: !currentStatus }
      });

      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, is_verified: !currentStatus }
          : user
      ));

      toast.success(`User ${!currentStatus ? 'verified' : 'unverified'} successfully`);
    } catch (error) {
      console.error('Error updating verification:', error);
      toast.error('Failed to update verification status');
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
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage users, verification status, and account settings.
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
                placeholder="Search users by name or email..."
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-gray-900">{user.name}</h3>
                    <Badge 
                      variant={user.user_type === 'craftsman' ? 'default' : 'secondary'}
                    >
                      {user.user_type === 'craftsman' ? 'Craftsman' : 'Customer'}
                    </Badge>
                    {user.user_type === 'craftsman' && (
                      <Badge 
                        variant={user.is_verified ? 'default' : 'destructive'}
                        className={user.is_verified ? 'bg-green-100 text-green-800' : ''}
                      >
                        {user.is_verified ? 'Verified' : 'Unverified'}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{user.email}</p>
                  <p className="text-sm text-gray-500">
                    {user.location} • Joined {new Date(user.created_at).toLocaleDateString()}
                  </p>
                  {user.trade_category && (
                    <p className="text-sm text-gray-500">Category: {user.trade_category}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {user.user_type === 'craftsman' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleVerification(user.id, user.is_verified || false)}
                    >
                      {user.is_verified ? (
                        <>
                          <ShieldCheck className="h-4 w-4 mr-2" />
                          Unverify
                        </>
                      ) : (
                        <>
                          <Shield className="h-4 w-4 mr-2" />
                          Verify
                        </>
                      )}
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">No users found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserManagement;
