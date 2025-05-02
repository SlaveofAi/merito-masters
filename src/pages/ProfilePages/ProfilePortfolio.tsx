
import React, { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ProfileProvider } from "@/contexts/ProfileContext";
import ProfilePage from "@/components/profile/ProfilePage";
import { useAuth } from "@/hooks/useAuth";
import ProfileSkeleton from "@/components/profile/ProfileSkeleton";

const ProfilePortfolio = () => {
  const { userType, loading } = useAuth();
  const navigate = useNavigate();
  
  // First check: Immediate redirect if we already know this is a customer
  if (userType === 'customer') {
    console.log("Customer detected in ProfilePortfolio, immediate redirect to reviews");
    return <Navigate to="/profile/reviews" replace />;
  }
  
  // Second check: If still loading, show skeleton and perform redirect once loaded
  useEffect(() => {
    if (loading) {
      return; // Wait for loading to complete
    }
    
    if (userType === 'customer') {
      console.log("Customer detected in ProfilePortfolio useEffect, redirecting to reviews");
      navigate("/profile/reviews", { replace: true });
    }
  }, [userType, loading, navigate]);

  // While auth is loading, show loading state
  if (loading) {
    return (
      <ProfileProvider>
        <ProfileSkeleton />
      </ProfileProvider>
    );
  }

  // Only show portfolio if we're sure it's not a customer
  return (
    <ProfileProvider>
      <ProfilePage initialTab="portfolio" />
    </ProfileProvider>
  );
};

export default ProfilePortfolio;
