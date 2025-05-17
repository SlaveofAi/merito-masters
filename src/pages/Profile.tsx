
import React, { useEffect } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { ProfileProvider } from "@/contexts/ProfileContext";
import ProfilePage from "@/components/profile/ProfilePage";
import { useAuth } from "@/hooks/useAuth";
import ProfileSkeleton from "@/components/profile/ProfileSkeleton";
import { toast } from "sonner";
import AuthRequiredMessage from "@/components/profile/AuthRequiredMessage";

const Profile = () => {
  const { id } = useParams();
  const { userType, loading, user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log("Profile route rendering with:", {
      id,
      userType,
      loading,
      userLoggedIn: !!user,
      path: window.location.pathname
    });
  }, [id, userType, loading, user]);
  
  // If not authenticated, show auth required message
  if (!loading && !user) {
    console.log("User not authenticated, showing auth required message");
    return <AuthRequiredMessage />;
  }
  
  // First check: Immediate redirect if we already know this is a customer without an ID param
  // and we're on the main profile route
  if (!id && userType === "customer" && window.location.pathname === "/profile") {
    console.log("Customer profile detected in main Profile route, immediate redirect to reviews");
    return <Navigate to="/profile/reviews" replace />;
  }
  
  // Second check: If still loading, monitor for changes
  useEffect(() => {
    if (loading) {
      return; // Wait for loading to complete
    }
    
    // If user type is not set and user is logged in, show user type selector
    if (!userType && user) {
      console.log("User type not set, will show UserTypeSelector in ProfilePage");
      return;
    }
    
    if (!id && userType === "customer" && window.location.pathname === "/profile") {
      console.log("Customer profile detected in Profile useEffect, redirecting to reviews");
      navigate("/profile/reviews", { replace: true });
    }
  }, [id, userType, loading, navigate, user]);
  
  // While auth is loading, show loading state
  if (loading) {
    return <ProfileSkeleton />;
  }

  // For the main Profile route, we want to show the calendar if explicitly requested
  // Otherwise, the default tab is set to "portfolio"
  const initialTab = window.location.pathname.endsWith('/calendar') ? "calendar" : "portfolio";
  
  return (
    <ProfileProvider>
      <ProfilePage initialTab={initialTab} />
    </ProfileProvider>
  );
};

export default Profile;
