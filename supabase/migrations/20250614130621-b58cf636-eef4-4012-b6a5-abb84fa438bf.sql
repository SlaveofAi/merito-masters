
-- Create blog categories table
CREATE TABLE public.blog_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blog tags table
CREATE TABLE public.blog_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blog posts table
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image_url TEXT,
  meta_title TEXT,
  meta_description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  view_count INTEGER NOT NULL DEFAULT 0,
  like_count INTEGER NOT NULL DEFAULT 0,
  author_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Create junction table for blog post categories
CREATE TABLE public.blog_post_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.blog_categories(id) ON DELETE CASCADE,
  UNIQUE(post_id, category_id)
);

-- Create junction table for blog post tags
CREATE TABLE public.blog_post_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.blog_tags(id) ON DELETE CASCADE,
  UNIQUE(post_id, tag_id)
);

-- Create blog post likes table
CREATE TABLE public.blog_post_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Create blog comments table
CREATE TABLE public.blog_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_id UUID,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  parent_id UUID REFERENCES public.blog_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all blog tables
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

-- RLS policies for blog_categories (public read, admin write)
CREATE POLICY "Anyone can view published categories" ON public.blog_categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.blog_categories FOR ALL USING (is_admin());

-- RLS policies for blog_tags (public read, admin write)
CREATE POLICY "Anyone can view tags" ON public.blog_tags FOR SELECT USING (true);
CREATE POLICY "Admins can manage tags" ON public.blog_tags FOR ALL USING (is_admin());

-- RLS policies for blog_posts
CREATE POLICY "Anyone can view published posts" ON public.blog_posts FOR SELECT USING (status = 'published');
CREATE POLICY "Admins can view all posts" ON public.blog_posts FOR SELECT USING (is_admin());
CREATE POLICY "Admins can manage posts" ON public.blog_posts FOR ALL USING (is_admin());

-- RLS policies for blog_post_categories
CREATE POLICY "Anyone can view post categories" ON public.blog_post_categories FOR SELECT USING (
  EXISTS (SELECT 1 FROM blog_posts WHERE id = post_id AND status = 'published')
);
CREATE POLICY "Admins can manage post categories" ON public.blog_post_categories FOR ALL USING (is_admin());

-- RLS policies for blog_post_tags
CREATE POLICY "Anyone can view post tags" ON public.blog_post_tags FOR SELECT USING (
  EXISTS (SELECT 1 FROM blog_posts WHERE id = post_id AND status = 'published')
);
CREATE POLICY "Admins can manage post tags" ON public.blog_post_tags FOR ALL USING (is_admin());

-- RLS policies for blog_post_likes
CREATE POLICY "Anyone can view likes" ON public.blog_post_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like posts" ON public.blog_post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike their own likes" ON public.blog_post_likes FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for blog_comments
CREATE POLICY "Anyone can view approved comments" ON public.blog_comments FOR SELECT USING (status = 'approved');
CREATE POLICY "Anyone can create comments" ON public.blog_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own comments" ON public.blog_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all comments" ON public.blog_comments FOR ALL USING (is_admin());

-- Create indexes for better performance
CREATE INDEX idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX idx_blog_posts_published_at ON public.blog_posts(published_at DESC) WHERE status = 'published';
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_categories_slug ON public.blog_categories(slug);
CREATE INDEX idx_blog_tags_slug ON public.blog_tags(slug);
CREATE INDEX idx_blog_post_likes_post_id ON public.blog_post_likes(post_id);
CREATE INDEX idx_blog_comments_post_id ON public.blog_comments(post_id) WHERE status = 'approved';

-- Create storage bucket for blog images
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true);

-- Storage policies for blog images
CREATE POLICY "Anyone can view blog images" ON storage.objects FOR SELECT USING (bucket_id = 'blog-images');
CREATE POLICY "Admins can upload blog images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'blog-images' AND is_admin());
CREATE POLICY "Admins can update blog images" ON storage.objects FOR UPDATE USING (bucket_id = 'blog-images' AND is_admin());
CREATE POLICY "Admins can delete blog images" ON storage.objects FOR DELETE USING (bucket_id = 'blog-images' AND is_admin());

-- Create function to automatically update blog post updated_at timestamp
CREATE OR REPLACE FUNCTION update_blog_post_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for blog posts updated_at
CREATE TRIGGER blog_posts_updated_at
    BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_blog_post_updated_at();

-- Insert some default categories
INSERT INTO public.blog_categories (name, slug, description, color) VALUES 
('Novinky', 'novinky', 'Najnovšie správy a novinky', '#3B82F6'),
('Tipy a triky', 'tipy-a-triky', 'Užitočné rady pre remeselníkov a zákazníkov', '#10B981'),
('Príbehy úspechov', 'pribehy-uspechov', 'Inšpirujúce príbehy našich používateľov', '#F59E0B');

-- Insert some default tags
INSERT INTO public.blog_tags (name, slug) VALUES 
('remeselníci', 'remeselnici'),
('zákazníci', 'zakaznici'),
('technológie', 'technologie'),
('trendy', 'trendy');
