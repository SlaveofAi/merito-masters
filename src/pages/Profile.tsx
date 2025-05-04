
import React, { useEffect } from "react";
import { useParams, Navigate, useNavigate, useLocation } from "react-router-dom";
import { ProfileProvider } from "@/contexts/ProfileContext";
import ProfilePage from "@/components/profile/ProfilePage";
import { useAuth } from "@/hooks/useAuth";
import ProfileSkeleton from "@/components/profile/ProfileSkeleton";
import { toast } from "sonner";

const Profile = () => {
  const { id, section } = useParams();
  const { userType, loading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Debug log to help with troubleshooting
  console.log("Profile component rendered with:", { 
    id, section, userType, loading, isLoggedIn: !!user,
    currentPath: location.pathname
  });
  
  // If an ID is explicitly provided, we're viewing someone else's profile
  const isViewingOtherProfile = !!id && id !== ":id" && id !== user?.id;
  
  // First check: Only redirect customers viewing their own profile with no section or non-reviews section
  useEffect(() => {
    if (!loading && user) {
      // Only redirect if viewing own profile (no ID) AND user is a customer AND section is not reviews
      if (!isViewingOtherProfile && userType === "customer" && (!section || section !== "reviews")) {
        console.log("Customer viewing own profile, redirecting to reviews tab");
        navigate("/profile/reviews", { replace: true });
      }
    }
  }, [id, userType, loading, user, section, navigate, isViewingOtherProfile]);
  
  // While auth is loading, show loading state
  if (loading) {
    return <ProfileSkeleton />;
  }
  
  // If user isn't logged in and tries to access their own profile, redirect to login
  if (!user && !id) {
    toast.error("Pre zobrazenie profilu sa najprv prihláste");
    return <Navigate to="/login" replace />;
  }

  // For the main Profile route, we want to show the calendar if explicitly requested
  // Otherwise, the default tab is set to "portfolio" for craftsmen and "reviews" for customers
  const getInitialTab = () => {
    if (section === "calendar") return "calendar";
    if (userType === "customer" && !isViewingOtherProfile) return "reviews";
    return "portfolio";
  };
  
  return (
    <ProfileProvider>
      <ProfilePage initialTab={getInitialTab()} isViewingOtherProfile={isViewingOtherProfile} />
    </ProfileProvider>
  );
};

export default Profile;
