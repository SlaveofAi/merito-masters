
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
  
  // Check if this is a craftsman profile view (route: /craftsman/:id)
  const isCraftsmanProfileRoute = location.pathname.startsWith('/craftsman/');
  
  // Check if this is a tab-only route like /profile/requests, /profile/reviews, etc.
  const isTabOnlyRoute = !id && tab && ['requests', 'reviews', 'portfolio', 'calendar'].includes(tab);
  
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
      tab,
      userType,
      loading,
      userLoggedIn: !!user,
      path: window.location.pathname,
      isCraftsmanProfileRoute,
      isTabOnlyRoute
    });
  }, [id, tab, userType, loading, user, isCraftsmanProfileRoute, isTabOnlyRoute]);
  
  // For craftsman profile routes, show content without authentication requirement
  if (isCraftsmanProfileRoute) {
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
    return <ProfileSkeleton />;
  }
  
  // Handle customer trying to access portfolio tab - redirect to reviews
  if (userType === "customer" && tab === "portfolio") {
    console.log("Customer trying to access portfolio, redirecting to reviews");
    return <Navigate to="/profile/reviews" replace />;
  }
  
  // We need to check if the user is trying to navigate to their own profile
  // by using an ID that matches their own ID
  const isViewingOwnProfileById = id && user && id === user.id;
  if (isViewingOwnProfileById) {
    console.log("User is viewing their own profile by ID, redirecting to /profile");
    return <Navigate to="/profile" replace />;
  }

  // For tab-only routes (like /profile/requests), use the tab directly
  let initialTab = "portfolio";
  if (isTabOnlyRoute) {
    initialTab = tab!;
  } else if (tab) {
    initialTab = tab;
  } else if (userType === 'customer' && !id) {
    // Default tab for customers viewing their own profile
    initialTab = "requests";
  }
  
  return (
    <ProfileProvider>
      <ProfilePage initialTab={initialTab} />
    </ProfileProvider>
  );
};

export default Profile;
