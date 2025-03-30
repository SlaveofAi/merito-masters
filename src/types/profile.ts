
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
  profile_image_url: string | null; // Add this field to match the actual data
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

export type CraftsmanReview = {
  id: string;
  craftsman_id: string;
  customer_id: string;
  customer_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
};
