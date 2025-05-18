
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
      path: window.location.pathname,
      isCurrentUserProfile: !id || id === user?.id
    });
  }, [id, userType, loading, user]);
  
  // If not authenticated, show auth required message
  if (!loading && !user) {
    console.log("User not authenticated, showing auth required message");
    return <AuthRequiredMessage />;
  }

  // First check: Only redirect if this is the current user's profile (no ID or ID matches user.id)
  // and we're on the main profile route
  const isCurrentUserProfile = !id || id === "" || id === ":id" || id === user?.id;
  
  // Only redirect customers viewing their own profile page
  if (isCurrentUserProfile && userType === "customer" && window.location.pathname === "/profile") {
    console.log("Customer's own profile detected in main Profile route, immediate redirect to reviews");
    return <Navigate to="/profile/reviews" replace />;
  }
  
  // If viewing someone else's profile, don't redirect
  if (id && id !== user?.id) {
    console.log("Viewing someone else's profile, no redirect needed");
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
    
    // Only redirect if this is the current user's profile with no ID specified
    // and the user is a customer viewing their own main profile
    const isCurrentUserProfile = !id || id === "" || id === ":id" || id === user?.id;
    if (isCurrentUserProfile && userType === "customer" && window.location.pathname === "/profile") {
      console.log("Customer viewing their own profile in Profile useEffect, redirecting to reviews");
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
