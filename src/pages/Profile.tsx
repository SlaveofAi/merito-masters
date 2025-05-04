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
  
  // First check: Immediate redirect if this is a customer trying to view a non-reviews section
  useEffect(() => {
    if (!loading && user) {
      // If no ID is provided (viewing own profile) and user is a customer
      if (!id && userType === "customer" && (!section || section !== "reviews")) {
        console.log("Customer profile detected, redirecting to reviews tab");
        navigate("/profile/reviews", { replace: true });
      }
    }
  }, [id, userType, loading, user, section, navigate]);
  
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
    if (userType === "customer") return "reviews";
    return "portfolio";
  };
  
  return (
    <ProfileProvider>
      <ProfilePage initialTab={getInitialTab()} />
    </ProfileProvider>
  );
};

export default Profile;
