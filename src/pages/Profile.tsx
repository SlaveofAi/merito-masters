
import React, { useEffect } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { ProfileProvider } from "@/contexts/ProfileContext";
import ProfilePage from "@/components/profile/ProfilePage";
import { useAuth } from "@/hooks/useAuth";
import ProfileSkeleton from "@/components/profile/ProfileSkeleton";

const Profile = () => {
  const { id } = useParams();
  const { userType, loading } = useAuth();
  const navigate = useNavigate();
  
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
  if (loading && !id) {
    return <ProfileSkeleton />;
  }
  
  return (
    <ProfileProvider>
      <ProfilePage initialTab="portfolio" />
    </ProfileProvider>
  );
};

export default Profile;
