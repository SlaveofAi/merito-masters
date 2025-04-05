
import React from "react";
import { useParams, Navigate } from "react-router-dom";
import { ProfileProvider } from "@/contexts/ProfileContext";

const Profile = () => {
  const { id } = useParams();
  
  // Default to portfolio page when just accessing /profile
  return (
    <ProfileProvider>
      {id ? (
        <Navigate to={`/profile/${id}/portfolio`} replace />
      ) : (
        <Navigate to="/profile/portfolio" replace />
      )}
    </ProfileProvider>
  );
};

export default Profile;
