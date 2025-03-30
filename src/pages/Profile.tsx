
import React from "react";
import { ProfileProvider } from "@/contexts/ProfileContext";
import ProfilePage from "@/components/profile/ProfilePage";

const Profile = () => {
  return (
    <ProfileProvider>
      <ProfilePage />
    </ProfileProvider>
  );
};

export default Profile;
