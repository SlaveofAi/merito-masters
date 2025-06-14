
import React, { useEffect } from "react";
import { useParams, Navigate, useNavigate, useLocation } from "react-router-dom";
import { ProfileProvider } from "@/contexts/ProfileContext";
import ProfilePage from "@/components/profile/ProfilePage";
import { useAuth } from "@/hooks/useAuth";
import ProfileSkeleton from "@/components/profile/ProfileSkeleton";
import { toast } from "sonner";
import AuthRequiredMessage from "@/components/profile/AuthRequiredMessage";
import Layout from "@/components/Layout";

const Profile = () => {
  const { id, tab } = useParams();
  const { userType, loading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  console.log("=== PROFILE PAGE DEBUG ===");
  console.log("Profile page rendering with:", {
    id,
    tab,
    userType,
    loading,
    userLoggedIn: !!user,
    path: window.location.pathname,
    userId: user?.id
  });
  
  // Check if this is a craftsman profile view (route: /craftsman/:id)
  const isCraftsmanProfileRoute = location.pathname.startsWith('/craftsman/');
  
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
  
  // Use this effect for customer redirects
  useEffect(() => {
    if (loading) {
      console.log("Still loading auth, waiting...");
      return; // Wait for loading to complete
    }
    
    // Skip redirects for craftsman profile routes
    if (isCraftsmanProfileRoute) {
      console.log("Craftsman profile route, skipping redirects");
      return;
    }
    
    // If user type is not set and user is logged in, show user type selector
    if (!userType && user) {
      console.log("User type not set, will show UserTypeSelector in ProfilePage");
      return;
    }
    
    // Only redirect customers from their own profile to requests tab
    if (!id && userType === "customer" && window.location.pathname === "/profile") {
      console.log("Customer profile detected in Profile useEffect, redirecting to reviews");
      navigate("/profile/reviews", { replace: true });
    }
  }, [id, userType, loading, navigate, user, isCraftsmanProfileRoute]);
  
  // For craftsman profile routes, show content without authentication requirement
  if (isCraftsmanProfileRoute) {
    console.log("Rendering craftsman profile route");
    return (
      <ProfileProvider>
        <ProfilePage initialTab="portfolio" />
      </ProfileProvider>
    );
  }
  
  // If not authenticated and not viewing craftsman profile, show auth required message
  if (!loading && !user) {
    console.log("User not authenticated, showing auth required message");
    return <AuthRequiredMessage />;
  }
  
  // While auth is loading, show loading state
  if (loading) {
    console.log("Auth still loading, showing skeleton");
    return <ProfileSkeleton />;
  }
  
  // Immediate redirect for customers viewing their own profile
  if (!id && userType === "customer" && window.location.pathname === "/profile") {
    console.log("Customer profile detected in main Profile route, immediate redirect to reviews");
    return <Navigate to="/profile/reviews" replace />;
  }
  
  // We need to check if the user is trying to navigate to their own profile
  // by using an ID that matches their own ID
  const isViewingOwnProfileById = id && user && id === user.id;
  if (isViewingOwnProfileById) {
    console.log("User is viewing their own profile by ID, redirecting to /profile");
    return <Navigate to="/profile" replace />;
  }

  // For the main Profile route, we want to show the reviews tab if it's a customer
  // or the calendar if explicitly requested, otherwise default to "portfolio"
  let initialTab = "portfolio";
  if (tab) {
    initialTab = tab;
  } else if (userType === 'customer' && !id) {
    initialTab = "reviews";
  }
  
  console.log("Rendering profile page with initialTab:", initialTab);
  
  return (
    <ProfileProvider>
      <ProfilePage initialTab={initialTab} />
    </ProfileProvider>
  );
};

export default Profile;
