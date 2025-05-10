
import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import NotificationList from "@/components/notifications/NotificationList";

const Notifications = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Only redirect if we're sure the user is not authenticated
    // and we've finished loading auth state
    if (!loading) {
      setIsCheckingAuth(false);
      if (!user) {
        toast.error("Pre prístup k notifikáciám sa musíte prihlásiť");
        navigate("/login", { replace: true, state: { from: "notifications" } });
      }
    }
  }, [user, loading, navigate]);

  if (loading || isCheckingAuth) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 mt-16">
          <h1 className="text-2xl font-bold mb-6">Notifikácie</h1>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <Skeleton className="w-full h-[400px]" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 mt-16">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Notifikácie</h1>
        </div>
        <NotificationList />
      </div>
    </Layout>
  );
};

export default Notifications;
