
import React, { useEffect } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { ProfileProvider } from "@/contexts/ProfileContext";
import ProfilePage from "@/components/profile/ProfilePage";
import { useAuth } from "@/hooks/useAuth";
import ProfileSkeleton from "@/components/profile/ProfileSkeleton";

const Profile = () => {
  const { id } = useParams();
  const { userType, loading, user } = useAuth();
  const navigate = useNavigate();
  
  // Enhanced debug logging
  useEffect(() => {
    console.log("Profile route rendering with:", {
      id,
      userType,
      loading,
      userLoggedIn: !!user,
      path: window.location.pathname
    });
  }, [id, userType, loading, user]);
  
  // First check: Immediate redirect if we already know this is a customer
  if (!id && userType === "customer") {
    console.log("Customer profile detected in main Profile route, immediate redirect to reviews");
    return <Navigate to="/profile/reviews" replace />;
  }
  
  // Second check: If still loading, monitor for changes
  useEffect(() => {
    if (loading) {
      return; // Wait for loading to complete
    }
    
    if (!id && userType === "customer") {
      console.log("Customer profile detected in Profile useEffect, redirecting to reviews");
      navigate("/profile/reviews", { replace: true });
    }
  }, [id, userType, loading, navigate]);
  
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
