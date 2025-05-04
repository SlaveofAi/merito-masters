
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useProfileData } from "@/hooks/useProfileData";
import { Camera, MapPin, Phone, Mail, CalendarRange, User, Clock } from "lucide-react";
import { toast } from "sonner";
import ToppedCraftsmanFeature from './ToppedCraftsmanFeature';

interface ProfileHeaderProps {
  profileData: any;
  isCurrentUser: boolean;
  userType?: 'customer' | 'craftsman' | null;
  profileImageUrl?: string | null;
  uploadProfileImage?: (file: File) => Promise<void>;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profileData,
  isCurrentUser,
  userType,
  profileImageUrl,
  uploadProfileImage,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  const { fetchProfileData } = useProfileData();
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Clear the input value so that the same file can be selected again if needed
      e.target.value = '';
      
      try {
        setUploading(true);
        
        if (uploadProfileImage) {
          await uploadProfileImage(file);
          toast.success("Profilová fotka bola úspešne aktualizovaná");
        }
      } catch (error) {
        console.error("Error uploading profile image:", error);
        toast.error("Nastala chyba pri nahrávaní profilovej fotky");
      } finally {
        setUploading(false);
      }
    }
  };
  
  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Get initials from name for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };
  
  if (!profileData) return null;

  return (
    <div className="mb-8">
      {/* If user is a craftsman, show the topped feature component */}
      {userType === 'craftsman' && (
        <ToppedCraftsmanFeature 
          isCurrentUser={isCurrentUser} 
          profileData={profileData} 
          onProfileUpdate={fetchProfileData} 
        />
      )}
      
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="relative">
          <Avatar className="h-24 w-24 border-2 border-muted">
            <AvatarImage 
              src={profileImageUrl || undefined} 
              alt={profileData.name} 
            />
            <AvatarFallback className="text-xl">
              {getInitials(profileData.name)}
            </AvatarFallback>
          </Avatar>
          
          {isCurrentUser && (
            <Button 
              size="icon" 
              variant="outline" 
              className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-background shadow-sm"
              onClick={openFileSelector}
              disabled={uploading}
            >
              <Camera className="h-4 w-4" />
              <span className="sr-only">Change profile photo</span>
            </Button>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
        
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-1">{profileData.name}</h1>
          
          {userType === 'craftsman' && (
            <div className="text-lg text-muted-foreground mb-4">
              {profileData.custom_specialization || profileData.trade_category}
            </div>
          )}
          
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <div className="flex items-center">
              <MapPin className="mr-2 h-4 w-4" />
              <span>{profileData.location}</span>
            </div>
            
            {profileData.phone && (
              <div className="flex items-center">
                <Phone className="mr-2 h-4 w-4" />
                <span>{profileData.phone}</span>
              </div>
            )}
            
            {profileData.email && (
              <div className="flex items-center">
                <Mail className="mr-2 h-4 w-4" />
                <span>{profileData.email}</span>
              </div>
            )}
            
            {userType === 'craftsman' && profileData.years_experience && (
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                <span>{profileData.years_experience} rokov skúseností</span>
              </div>
            )}
            
            <div className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              <span>
                {userType === 'customer' ? 'Zákazník' : userType === 'craftsman' ? 'Remeselník' : 'Používateľ'}
              </span>
            </div>
            
            <div className="flex items-center">
              <CalendarRange className="mr-2 h-4 w-4" />
              <span>Používateľ od {new Date(profileData.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
