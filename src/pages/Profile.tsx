
import React from "react";
import { useParams, Navigate } from "react-router-dom";
import { ProfileProvider } from "@/contexts/ProfileContext";
import ProfilePage from "@/components/profile/ProfilePage";
import { useAuth } from "@/hooks/useAuth";

const Profile = () => {
  const { id } = useParams();
  const { userType } = useAuth();
  
  // If we know this is a customer profile from Auth context, redirect to reviews immediately
  // This happens synchronously during the initial render
  if (!id && userType === 'customer') {
    console.log("Customer profile detected in main Profile route, redirecting to reviews");
    return <Navigate to="/profile/reviews" replace />;
  }
  
  return (
    <ProfileProvider>
      <ProfilePage />
    </ProfileProvider>
  );
};

export default Profile;
