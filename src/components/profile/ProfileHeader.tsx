
import React, { useRef } from 'react';
import { useProfile } from "@/contexts/ProfileContext";
import { useImageUploader } from './ImageUploader';
import SpecializationInput from './SpecializationInput';
import { Pencil, Share2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useQRCode } from '@/hooks/useQRCode';
import CraftsmanSpecialization from './CraftsmanSpecialization';

// Create a wrapper component for image uploading functionality
const ImageUploader: React.FC<{
  handleImageUpload: (event: React.ChangeEvent<HTMLInputElement> | File | Blob) => void;
  children: React.ReactNode;
}> = ({ handleImageUpload, children }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleImageUpload(e.target.files[0]);
    }
  };
  
  return (
    <div onClick={handleClick} className="cursor-pointer">
      {children}
      <input
        type="file"
        ref={inputRef}
        onChange={handleChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
};

const ProfileHeader: React.FC = () => {
  const { 
    profileData, 
    userType, 
    isCurrentUser, 
    profileImageUrl,
    customSpecialization,
    handleProfileImageUpload,
    updateCustomSpecialization,
    saving
  } = useProfile();

  const qrCodeRef = useRef<HTMLDivElement>(null);
  const { generateQRCode, showQRCode, setShowQRCode } = useQRCode();

  if (!profileData) return null;

  const handleShareProfile = () => {
    if (typeof window !== 'undefined') {
      const currentUrl = window.location.href;
      generateQRCode(currentUrl);
    }
  };

  const getInitials = () => {
    if (!profileData.name) return '?';
    return profileData.name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const isCraftsman = userType === 'craftsman';
  
  return (
    <div className="relative bg-white rounded-lg p-6 shadow-sm border border-border/50 mb-8">
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        <div className="relative">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profileImageUrl || undefined} alt={profileData.name || 'Profile'} />
            <AvatarFallback className="text-2xl bg-primary/10">{getInitials()}</AvatarFallback>
          </Avatar>
          
          {isCurrentUser && (
            <ImageUploader handleImageUpload={handleProfileImageUpload}>
              <Button 
                variant="outline" 
                size="icon" 
                className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-background border border-input"
              >
                <Pencil className="h-3 w-3" />
              </Button>
            </ImageUploader>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <h1 className="text-2xl font-bold">{profileData.name || 'Používateľ'}</h1>
              
              {isCraftsman && 'trade_category' in profileData && (
                <CraftsmanSpecialization 
                  tradeCategory={profileData.trade_category}
                  customSpecialization={customSpecialization || profileData.custom_specialization}
                  yearsExperience={profileData.years_experience}
                />
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant={isCraftsman ? "default" : "outline"} className={isCraftsman ? "bg-primary" : ""}>
                {isCraftsman ? 'Remeselník' : 'Zákazník'}
              </Badge>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleShareProfile} 
                className="flex items-center gap-1"
              >
                <Share2 className="h-4 w-4" />
                Zdieľať
              </Button>
            </div>
          </div>
          
          {isCraftsman && isCurrentUser && 'custom_specialization' in profileData && (
            <div className="mt-3">
              <label className="text-sm font-medium mb-1 block">Vlastná špecializácia:</label>
              <SpecializationInput 
                value={customSpecialization || profileData.custom_specialization || ''}
                onSave={updateCustomSpecialization}
                isLoading={saving}
              />
            </div>
          )}
          
          {profileData.location && (
            <div className="mt-2 text-sm text-muted-foreground">
              {profileData.location}
            </div>
          )}
        </div>
      </div>
      
      {showQRCode && (
        <div 
          ref={qrCodeRef} 
          className="absolute top-full right-0 mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
        >
          <div className="flex flex-col items-center">
            <div id="qrcode" className="mb-2"></div>
            <p className="text-sm text-center">Naskenujte kód pre zdieľanie profilu</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2" 
              onClick={() => setShowQRCode(false)}
            >
              Zavrieť
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileHeader;
