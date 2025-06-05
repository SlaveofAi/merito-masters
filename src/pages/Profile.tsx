
import React, { useEffect } from "react";
import { useParams, Navigate, useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();
  
  // IMPORTANT: All hooks must be called before any conditional returns
  
  // Get userType from query parameter if available (for Google OAuth redirect)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const queryUserType = params.get('userType');
    
    if (queryUserType === 'customer' || queryUserType === 'craftsman') {
      console.log("Found userType in URL params:", queryUserType);
      localStorage.setItem("userType", queryUserType);
      sessionStorage.setItem("userType", queryUserType);
      
      // Remove the query parameter from the URL without reloading the page
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [location]);
  
  // Debug log
  useEffect(() => {
    console.log("Profile route rendering with:", {
      id,
      userType,
      loading,
      userLoggedIn: !!user,
      path: window.location.pathname
    });
  }, [id, userType, loading, user]);
  
  // Use this effect for customer redirects - only for own profile
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
      console.log("Customer profile detected in Profile useEffect, redirecting to requests");
      navigate("/profile/requests", { replace: true });
    }
  }, [id, userType, loading, navigate, user]);
  
  // After all hooks are defined, we can have conditional returns
  // This fixes the "Rendered fewer hooks than expected" error
  
  // If not authenticated, show auth required message
  if (!loading && !user) {
    console.log("User not authenticated, showing auth required message");
    return <AuthRequiredMessage />;
  }
  
  // While auth is loading, show loading state
  if (loading) {
    return <ProfileSkeleton />;
  }
  
  // Immediate redirect for customers viewing own profile
  if (!id && userType === "customer" && window.location.pathname === "/profile") {
    console.log("Customer profile detected in main Profile route, immediate redirect to requests");
    return <Navigate to="/profile/requests" replace />;
  }
  
  // Check if the user is trying to navigate to their own profile by using an ID that matches their own ID
  // Only redirect if they're viewing their own profile by ID
  const isViewingOwnProfileById = id && user && id === user.id;
  if (isViewingOwnProfileById) {
    console.log("User is viewing their own profile by ID, redirecting to /profile");
    return <Navigate to="/profile" replace />;
  }

  // For the main Profile route, determine the initial tab
  let initialTab = "portfolio";
  if (window.location.pathname.endsWith('/calendar')) {
    initialTab = "calendar";
  } else if (window.location.pathname.endsWith('/requests')) {
    initialTab = "requests";
  } else if (userType === 'customer' && !id) {
    // Only redirect to requests if it's the user's own profile (no id)
    initialTab = "requests";
  }
  
  return (
    <ProfileProvider>
      <ProfilePage initialTab={initialTab} />
    </ProfileProvider>
  );
};

export default Profile;
