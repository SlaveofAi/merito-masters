import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { User, UploadCloud, MapPin, Phone, MessageSquare, Star } from "lucide-react";
import EditProfileForm from "@/components/EditProfileForm";
import { useProfile } from "@/contexts/ProfileContext";
import { useNavigate } from "react-router-dom";
import ImageCropper from "./ImageCropper";
import { getCroppedImg } from "@/utils/imageCrop";

const ProfileHeader: React.FC = () => {
  const {
    profileData,
    userType,
    isCurrentUser,
    isEditing,
    setIsEditing,
    profileImageUrl,
    handleProfileImageUpload,
    uploading,
    handleProfileUpdate,
    reviews
  } = useProfile();

  const navigate = useNavigate();
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);
  const [cropperVisible, setCropperVisible] = useState(false);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  if (!profileData) return null;

  const calculateAverageRating = () => {
    if (!reviews || reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  const averageRating = calculateAverageRating();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setTempImageSrc(reader.result as string);
        setCropperVisible(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedArea: any) => {
    setCroppedAreaPixels(croppedArea);
  };

  const handleCropCancel = () => {
    setTempImageSrc(null);
    setCropperVisible(false);
  };

  const handleCropConfirm = async () => {
    try {
      if (tempImageSrc && croppedAreaPixels) {
        const croppedImage = await getCroppedImg(tempImageSrc, croppedAreaPixels);
        if (croppedImage) {
          handleProfileImageUpload(croppedImage);
          setCropperVisible(false);
          setTempImageSrc(null);
        }
      }
    } catch (error) {
      console.error('Error cropping image:', error);
    }
  };

  const navigateToMessages = () => {
    navigate("/messages");
  };

  return (
    <div className="bg-white border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3">
            <div className="relative w-48 h-48 mx-auto md:mx-0 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-100">
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt={profileData.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-24 h-24 text-gray-300" />
                </div>
              )}
              
              {isCurrentUser && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                  <label htmlFor="profile-image-upload" className="cursor-pointer flex flex-col items-center justify-center text-white">
                    <UploadCloud className="w-8 h-8 mb-2" />
                    <span className="text-sm">Nahrať fotku</span>
                    <input
                      id="profile-image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageSelect}
                      disabled={uploading}
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
          
          <div className="w-full md:w-2/3 text-center md:text-left">
            {isCurrentUser && !isEditing && (
              <Button 
                variant="outline" 
                className="mb-4"
                onClick={() => setIsEditing(true)}
              >
                Upraviť profil
              </Button>
            )}
            
            {isEditing && profileData ? (
              <div className="mb-6">
                <EditProfileForm 
                  profile={profileData} 
                  userType={userType}
                  onUpdate={handleProfileUpdate} 
                />
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => setIsEditing(false)}
                >
                  Zrušiť
                </Button>
              </div>
            ) : (
              <>
                <h1 className="text-3xl md:text-4xl font-bold mb-1">
                  {profileData.name}
                </h1>
                
                {userType === 'craftsman' && 'trade_category' in profileData && (
                  <div className="mb-3 font-medium text-lg">
                    {profileData.trade_category}
                    {profileData.custom_specialization && (
                      <span className="text-muted-foreground ml-2">
                        - {profileData.custom_specialization}
                      </span>
                    )}
                  </div>
                )}
                
                <div className="flex items-center justify-center md:justify-start mb-4">
                  {userType === 'craftsman' && (
                    <div className="flex items-center mr-4">
                      <Star className={`w-5 h-5 ${Number(averageRating) > 0 ? 'fill-current text-yellow-500' : ''} mr-1`} />
                      <span className="font-semibold">{averageRating}</span>
                      <span className="text-muted-foreground ml-1">
                        ({reviews ? reviews.length : 0} hodnotení)
                      </span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {profileData.location}
                    </span>
                  </div>
                </div>
                {'description' in profileData && userType === 'craftsman' && profileData.description && (
                  <p className="text-muted-foreground mb-6 max-w-2xl mx-auto md:mx-0">
                    {profileData.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <Button className="flex items-center">
                    <Phone className="mr-2 h-4 w-4" />
                    Kontaktovať
                  </Button>
                  <Button variant="outline" onClick={navigateToMessages}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Správa
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {cropperVisible && tempImageSrc && (
        <ImageCropper
          imageSrc={tempImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          onConfirm={handleCropConfirm}
        />
      )}
    </div>
  );
};

export default ProfileHeader;
