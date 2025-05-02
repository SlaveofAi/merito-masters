
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { ProfileProvider } from "@/contexts/ProfileContext";
import ProfilePage from "@/components/profile/ProfilePage";
import { useAuth } from "@/hooks/useAuth";

const Profile = () => {
  const { id } = useParams();
  const { userType } = useAuth();
  
  useEffect(() => {
    // Add debugging for profile loading
    console.log("Profile page loaded with:", {
      id,
      userType
    });
  }, [id, userType]);
  
  return (
    <ProfileProvider>
      <ProfilePage />
    </ProfileProvider>
  );
};

export default Profile;
