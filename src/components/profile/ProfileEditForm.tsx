
import React from "react";
import { useProfile } from "@/contexts/ProfileContext";
import EditProfileForm from "@/components/EditProfileForm";

interface ProfileEditFormProps {
  profileData: any;
  onProfileUpdate: () => void;
  onCancel: () => void;
}

const ProfileEditForm = ({ profileData, onProfileUpdate, onCancel }: ProfileEditFormProps) => {
  const { userType } = useProfile();

  const handleUpdate = (updatedProfile: any) => {
    onProfileUpdate();
  };

  return (
    <div>
      <EditProfileForm 
        profile={profileData} 
        userType={userType} 
        onUpdate={handleUpdate}
      />
      <div className="flex justify-end gap-2 mt-4">
        <button 
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
        >
          Zrušiť
        </button>
      </div>
    </div>
  );
};

export default ProfileEditForm;
