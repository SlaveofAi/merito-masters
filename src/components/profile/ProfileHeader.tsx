import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit2, MapPin, Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ProfileEditForm from "@/components/profile/ProfileEditForm";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { calculateAverageRating } from "@/lib/utils";
import ToppedCraftsmanFeature from "@/components/profile/ToppedCraftsmanFeature";

interface ProfileData {
  id: string;
  name: string;
  email: string;
  location: string;
  specializations: string[];
  description: string;
  image_url: string | null;
  rating: number | null;
  review_count: number | null;
}

const ProfileHeader = ({ 
  isCurrentUser, 
  profileData, 
  onProfileUpdate 
}: { 
  isCurrentUser: boolean; 
  profileData: ProfileData; 
  onProfileUpdate: () => void; 
}) => {
  const { user } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const averageRating = calculateAverageRating(profileData.rating, profileData.review_count);

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
            {/* Profile Image */}
            <div className="flex items-center">
              <Avatar className="h-24 w-24 lg:h-32 lg:w-32 rounded-full border">
                {profileData.image_url ? (
                  <AvatarImage src={profileData.image_url} alt={profileData.name} />
                ) : (
                  <AvatarFallback>{profileData.name.charAt(0)}</AvatarFallback>
                )}
              </Avatar>
            </div>
            
            {/* Profile Info */}
            <div className="flex-1 min-w-0 lg:ml-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold text-gray-900">{profileData.name}</h1>
                  <div className="flex items-center text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    {profileData.location}
                  </div>
                  <div className="flex items-center mt-2">
                    <Star className="h-4 w-4 mr-1 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-700">{averageRating}</span>
                    <span className="text-gray-500 text-sm ml-1">
                      ({profileData.review_count || 0} reviews)
                    </span>
                  </div>
                </div>
                
                {isCurrentUser && (
                  <div className="mt-4 sm:mt-0 sm:ml-4 flex-shrink-0">
                    <Button onClick={() => setIsEditModalOpen(true)} variant="outline">
                      <Edit2 className="h-4 w-4 mr-2" />
                      Upraviť profil
                    </Button>
                  </div>
                )}
              </div>

              {/* Specializations */}
              <div className="mt-4">
                <h2 className="text-sm font-semibold text-gray-500">Špecializácie</h2>
                <div className="mt-1 flex flex-wrap gap-2">
                  {profileData.specializations.map((spec, index) => (
                    <Badge key={index} variant="secondary">{spec}</Badge>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="mt-4">
                <h2 className="text-sm font-semibold text-gray-500">Popis</h2>
                <p className="mt-1 text-gray-700">{profileData.description}</p>
              </div>

              {/* Topped Feature for Current User */}
              {isCurrentUser && (
                <div className="mt-6">
                  <ToppedCraftsmanFeature />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Upraviť profil</DialogTitle>
            <DialogDescription>
              Pre upravu svojich udajov vyplnte tento formular.
            </DialogDescription>
          </DialogHeader>
          <ProfileEditForm 
            profileData={profileData} 
            onProfileUpdate={() => {
              onProfileUpdate();
              setIsEditModalOpen(false);
            }} 
            onCancel={() => setIsEditModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileHeader;
