
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image_url?: string;
  meta_title?: string;
  meta_description?: string;
  status: 'draft' | 'published';
  view_count: number;
  like_count: number;
  author_id: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
  categories?: BlogCategory[];
  tags?: BlogTag[];
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface BlogComment {
  id: string;
  post_id: string;
  user_id?: string;
  author_name: string;
  author_email: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  parent_id?: string;
  created_at: string;
  replies?: BlogComment[];
}

export interface BlogPostLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface CreateBlogPostData {
  title: string;
  content: string;
  excerpt?: string;
  featured_image_url?: string;
  meta_title?: string;
  meta_description?: string;
  status: 'draft' | 'published';
  category_ids?: string[];
  tag_ids?: string[];
}

export interface UpdateBlogPostData extends Partial<CreateBlogPostData> {
  id: string;
}
