
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useProfileData } from "@/hooks/useProfileData";
import { Camera, MapPin, Phone, Mail, CalendarRange, User, Clock, MessageSquare } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import ToppedCraftsmanFeature from './ToppedCraftsmanFeature';
import { ProfileData, CraftsmanProfile } from "@/types/profile";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export interface ProfileHeaderProps {
  profileData: ProfileData;
  isCurrentUser: boolean;
  userType?: 'customer' | 'craftsman' | null;
  profileImageUrl?: string | null;
  uploadProfileImage?: (file: File) => Promise<void>;
  fetchProfileData?: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profileData,
  isCurrentUser,
  userType,
  profileImageUrl,
  uploadProfileImage,
  fetchProfileData,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
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
  
  // Function to handle sending a message to the craftsman
  const handleSendMessage = async () => {
    if (!user) {
      toast.error("Pre kontaktovanie remeselníka sa musíte prihlásiť");
      navigate("/login", { state: { from: "profile-contact" } });
      return;
    }
    
    if (!profileData) {
      toast.error("Nepodarilo sa načítať profil remeselníka");
      return;
    }
    
    try {
      // Check if conversation already exists
      const { data: existingConversation, error: fetchError } = await supabase
        .from("chat_conversations")
        .select("id")
        .eq("customer_id", user.id)
        .eq("craftsman_id", profileData.id)
        .maybeSingle();
        
      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Error checking for conversation:", fetchError);
        toast.error("Nastala chyba pri kontrole konverzácie");
        return;
      }
      
      let conversationId;
      
      if (existingConversation) {
        // Use existing conversation
        conversationId = existingConversation.id;
      } else {
        // Create new conversation
        const { data: newConversation, error: createError } = await supabase
          .from("chat_conversations")
          .insert({
            customer_id: user.id,
            craftsman_id: profileData.id
          })
          .select();
          
        if (createError) {
          console.error("Error creating conversation:", createError);
          toast.error("Nepodarilo sa vytvoriť konverzáciu");
          return;
        }
        
        conversationId = newConversation?.[0]?.id;
      }
      
      if (conversationId) {
        // Navigate to messages with the conversation context
        navigate("/messages", { 
          state: { 
            from: "profile",
            conversationId,
            contactId: profileData.id 
          } 
        });
        toast.success("Presmerované do správ");
      }
    } catch (err) {
      console.error("Error navigating to chat:", err);
      toast.error("Nastala chyba pri presmerovaní do správ");
    }
  };
  
  if (!profileData) return null;

  return (
    <div className="mb-8">
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
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold mb-1">{profileData.name}</h1>
              
              {userType === 'craftsman' && isCraftsmanProfile(profileData) && (
                <div className="text-lg text-muted-foreground mb-4">
                  {profileData.custom_specialization || profileData.trade_category}
                </div>
              )}
            </div>
            
            {/* Add send message button for customers viewing craftsman profiles */}
            {!isCurrentUser && userType === 'customer' && profileData.user_type === 'craftsman' && (
              <Button 
                onClick={handleSendMessage}
                className="ml-auto"
                variant="default"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Poslať správu
              </Button>
            )}
          </div>
          
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
    </div>
  );
};

export default ProfileHeader;
