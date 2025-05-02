
import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { ProfileProvider } from "@/contexts/ProfileContext";
import ProfilePage from "@/components/profile/ProfilePage";
import { useAuth } from "@/hooks/useAuth";

const ProfilePortfolio = () => {
  const { userType } = useAuth();
  
  useEffect(() => {
    console.log("ProfilePortfolio component loaded with userType:", userType);
  }, [userType]);

  // If we know this is a customer profile, redirect immediately to reviews
  if (userType === 'customer') {
    console.log("Customer detected, redirecting from portfolio to reviews");
    return <Navigate to="/profile/reviews" replace />;
  }

  return (
    <ProfileProvider>
      <ProfilePage />
    </ProfileProvider>
  );
};

export default ProfilePortfolio;
