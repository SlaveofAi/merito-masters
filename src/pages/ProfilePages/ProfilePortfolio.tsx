
import React from "react";
import { Navigate } from "react-router-dom";
import { ProfileProvider } from "@/contexts/ProfileContext";
import ProfilePage from "@/components/profile/ProfilePage";
import { useAuth } from "@/hooks/useAuth";

const ProfilePortfolio = () => {
  const { userType } = useAuth();
  
  // If we know this is a customer profile, redirect immediately to reviews
  // This check happens synchronously during initial render
  if (userType === 'customer') {
    console.log("Customer detected in ProfilePortfolio, redirecting to reviews");
    return <Navigate to="/profile/reviews" replace />;
  }

  return (
    <ProfileProvider>
      <ProfilePage initialTab="portfolio" />
    </ProfileProvider>
  );
};

export default ProfilePortfolio;
