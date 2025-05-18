
import React, { useEffect } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { ProfileProvider } from "@/contexts/ProfileContext";
import ProfilePage from "@/components/profile/ProfilePage";
import { useAuth } from "@/hooks/useAuth";
import ProfileSkeleton from "@/components/profile/ProfileSkeleton";
import { toast } from "sonner";
import AuthRequiredMessage from "@/components/profile/AuthRequiredMessage";
import { supabase } from "@/integrations/supabase/client";

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
  
  // First check: Immediate redirect if we already know this is a customer
  // Only redirect if:
  // 1. No profile ID is provided (viewing own profile)
  // 2. User is a customer
  // 3. We're on the main profile page (not /profile/reviews)
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
    
    // Only redirect if viewing own profile (no ID passed), not when viewing someone else's
    if (!id && userType === "customer" && window.location.pathname === "/profile") {
      console.log("Customer profile detected in Profile useEffect, redirecting to reviews");
      navigate("/profile/reviews", { replace: true });
    }
  }, [id, userType, loading, navigate, user]);
  
  // While auth is loading, show loading state
  if (loading) {
    return <ProfileSkeleton />;
  }
  
  // We need to check if the user is trying to navigate to their own profile
  // by using an ID that matches their own ID
  const isViewingOwnProfileById = id && user && id === user.id;
  if (isViewingOwnProfileById) {
    console.log("User is viewing their own profile by ID, redirecting to /profile");
    return <Navigate to="/profile" replace />;
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
