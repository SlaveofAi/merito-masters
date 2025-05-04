
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
  custom_specialization?: string | null;
  user_type?: 'craftsman';
  is_topped?: boolean;
  topped_until?: string | null;
};

export type CustomerProfile = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  location: string;
  created_at: string;
  updated_at: string;
  profile_image_url: string | null;
  user_type?: 'customer';
};

export type ProfileData = (CraftsmanProfile | CustomerProfile) & {
  user_type?: string;
};

export type PortfolioImage = {
  id: string;
  craftsman_id: string;
  image_url: string;
  title: string | null;
  description: string | null;
  created_at: string;
};

export type ReviewReply = {
  id: string;
  review_id: string;
  craftsman_id: string;
  reply: string;
  created_at: string | null;
};

export type CraftsmanReview = {
  id: string;
  craftsman_id: string;
  customer_id: string;
  customer_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reply: ReviewReply | null;
  customer_profile_image?: string | null;
};

// Adding a basic profile type for the minimal profile data from the profiles table
export type BasicProfile = {
  id: string;
  name: string | null;
  email?: string;
  location?: string;
  profile_image_url?: string | null;
  phone?: string | null;
  created_at: string;
  updated_at: string;
  user_type?: string;
};

// Add Project type to make it easier to work with projects
export type Project = {
  id: string;
  craftsman_id: string;
  title: string;
  description: string | null;
  images: string[];
  created_at: string;
};
