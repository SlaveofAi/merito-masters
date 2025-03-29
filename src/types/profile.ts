
export type UserTypeRecord = {
  user_type: string;
  user_id: string;
  created_at: string;
};

export type CraftsmanProfile = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  profile_image_url: string | null;
  description: string | null;
  trade_category: string;
  location: string;
  created_at: string;
  updated_at: string;
  years_experience: number | null;
};

export type CustomerProfile = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  location: string;
  created_at: string;
  updated_at: string;
  profile_image_url?: string | null;
};

export type ProfileData = CraftsmanProfile | CustomerProfile;

export type PortfolioImage = {
  id: string;
  craftsman_id: string;
  image_url: string;
  title: string | null;
  description: string | null;
  created_at: string;
};
