import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, MapPin, CalendarRange, User, Clock, Crown, Loader2, Lock, Phone, Mail } from "lucide-react";
import { toast } from "sonner";
import ToppedCraftsmanFeature from './ToppedCraftsmanFeature';
import { ProfileData, CraftsmanProfile } from "@/types/profile";
import ImageCropper from './ImageCropper';
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

export interface ProfileHeaderProps {
  profileData: ProfileData;
  isCurrentUser: boolean;
  userType?: 'customer' | 'craftsman' | null;
  profileImageUrl?: string | null;
  uploadProfileImage?: (file: File) => Promise<void>;
  fetchProfileData?: () => void;
  refreshProfileImage?: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profileData,
  isCurrentUser,
  userType,
  profileImageUrl,
  uploadProfileImage,
  fetchProfileData,
  refreshProfileImage,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  const [showImageCropper, setShowImageCropper] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Type guard function to check if a profile is a craftsman profile
  const isCraftsmanProfile = (profile: ProfileData): profile is CraftsmanProfile => {
    return profile.user_type === 'craftsman';
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Clear the input value so that the same file can be selected again if needed
      e.target.value = '';
      
      // Show image cropper dialog instead of directly uploading
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setSelectedImage(reader.result.toString());
          setShowImageCropper(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleCroppedImage = async (blob: Blob) => {
    try {
      setUploading(true);
      setShowImageCropper(false);
      
      console.log("User type in handleCroppedImage:", userType);
      console.log("Profile data in handleCroppedImage:", profileData);
      
      // Convert blob to File for compatibility
      const file = new File([blob], 'profile-image.jpg', { type: 'image/jpeg' });
      
      if (!uploadProfileImage) {
        // If the uploadProfileImage function was not provided, use direct upload from utils
        console.log(`Using direct upload for user ${profileData.id} with type ${profileData.user_type}`);
        const { uploadProfileImage: directUpload } = await import('@/utils/imageUpload');
        
        if (directUpload && profileData && profileData.id) {
          const url = await directUpload(file, profileData.id, profileData.user_type || userType);
          
          if (url) {
            toast.success("Profilová fotka bola úspešne aktualizovaná");
            
            // Refresh profile data to show the new image
            if (fetchProfileData) {
              console.log("Calling fetchProfileData after direct upload");
              await fetchProfileData();
            }
            
            // Additional refresh to ensure the UI updates
            if (refreshProfileImage) {
              console.log("Calling refreshProfileImage after direct upload");
              setTimeout(() => {
                refreshProfileImage();
              }, 500);
            }
          } else {
            throw new Error("Failed to upload profile image");
          }
        } else {
          throw new Error("Missing required data for profile image upload");
        }
      } else {
        console.log("Using provided uploadProfileImage function");
        // Use the provided upload function if available
        await uploadProfileImage(file);
        toast.success("Profilová fotka bola úspešne aktualizovaná");
        
        // Refresh profile data to show the new image
        if (fetchProfileData) {
          console.log("Calling fetchProfileData after upload");
          await fetchProfileData();
        }
        
        // Additional refresh to ensure the UI updates
        if (refreshProfileImage) {
          console.log("Calling refreshProfileImage after upload");
          setTimeout(() => {
            refreshProfileImage();
          }, 500);
        }
      }
    } catch (error) {
      console.error("Error uploading profile image:", error);
      toast.error("Nastala chyba pri nahrávaní profilovej fotky");
    } finally {
      setUploading(false);
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
  
  // Check if craftsman profile is topped
  const isTopped = isCraftsmanProfile(profileData) && profileData.is_topped;
  
  if (!profileData) return null;

  return (
    <div className="mb-8">
      {showImageCropper && selectedImage && (
        <ImageCropper
          imageSrc={selectedImage}
          onCropComplete={handleCroppedImage}
          onCancel={() => setShowImageCropper(false)}
          aspectRatio={1}
        />
      )}
    
      {/* If user is a craftsman, show the topped feature component */}
      {userType === 'craftsman' && (
        <ToppedCraftsmanFeature 
          isCurrentUser={isCurrentUser} 
          profileData={profileData} 
          onProfileUpdate={fetchProfileData || (() => {})} 
        />
      )}
      
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="relative">
          <Avatar className={`h-24 w-24 border-2 ${isTopped ? 'border-yellow-400' : 'border-muted'}`}>
            {uploading ? (
              <div className="flex items-center justify-center w-full h-full bg-gray-100">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <AvatarImage 
                  src={profileImageUrl || undefined} 
                  alt={profileData.name}
                />
                <AvatarFallback className="text-xl">
                  {getInitials(profileData.name)}
                </AvatarFallback>
              </>
            )}
          </Avatar>
          
          {isCurrentUser && (
            <Button 
              size="icon" 
              variant="outline" 
              className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-background shadow-sm"
              onClick={openFileSelector}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
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
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold">{profileData.name}</h1>
            {isTopped && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300 flex items-center gap-1">
                <Crown className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                <span>Premium</span>
              </Badge>
            )}
          </div>
          
          {userType === 'craftsman' && isCraftsmanProfile(profileData) && (
            <div className="text-lg text-muted-foreground mb-4">
              {profileData.custom_specialization || profileData.trade_category}
            </div>
          )}
          
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <div className="flex items-center">
              <MapPin className="mr-2 h-4 w-4" />
              <span>{profileData.location}</span>
            </div>
            
            {/* Show contact info only for current user viewing their own profile */}
            {isCurrentUser && (
              <>
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
              </>
            )}
            
            {/* Show contact privacy notice ONLY for non-logged-in users */}
            {!isCurrentUser && !user && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-2">
                <div className="flex items-center gap-2 text-blue-700">
                  <Lock className="h-4 w-4" />
                  <span className="text-sm font-medium">Kontaktné údaje sú súkromné</span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Pre komunikáciu s remeselníkom použite chat funkciu.
                  Najprv sa musíte{" "}
                  <button
                    onClick={() => navigate("/register")}
                    className="underline font-medium hover:text-blue-800"
                  >
                    zaregistrovať
                  </button>
                  {" "}alebo{" "}
                  <button
                    onClick={() => navigate("/login")}
                    className="underline font-medium hover:text-blue-800"
                  >
                    prihlásiť
                  </button>
                </p>
              </div>
            )}
            
            {userType === 'craftsman' && isCraftsmanProfile(profileData) && profileData.years_experience && (
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
      
      {/* Display service description for craftsman profiles */}
      {userType === 'craftsman' && isCraftsmanProfile(profileData) && profileData.description && (
        <div className="mt-4 bg-gray-50 p-4 rounded-md border">
          <h3 className="text-sm font-medium mb-2">Popis služieb</h3>
          <p className="text-sm text-muted-foreground">{profileData.description}</p>
        </div>
      )}
    </div>
  );
};

export default ProfileHeader;
