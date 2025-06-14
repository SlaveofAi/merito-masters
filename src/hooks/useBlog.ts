
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BlogPost, BlogCategory, BlogTag, CreateBlogPostData, UpdateBlogPostData } from "@/types/blog";

// Utility function to generate slug from title
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// Blog Posts Hooks
export const useBlogPosts = (status?: 'all' | 'published' | 'draft') => {
  return useQuery({
    queryKey: ['blog-posts', status],
    queryFn: async () => {
      let query = supabase
        .from('blog_posts')
        .select(`
          *,
          blog_post_categories (
            blog_categories (*)
          ),
          blog_post_tags (
            blog_tags (*)
          )
        `)
        .order('created_at', { ascending: false });

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transform the data to include categories and tags directly
      const transformedData = data?.map(post => ({
        ...post,
        categories: post.blog_post_categories?.map((pc: any) => pc.blog_categories) || [],
        tags: post.blog_post_tags?.map((pt: any) => pt.blog_tags) || []
      })) || [];

      return transformedData as BlogPost[];
    },
  });
};

export const useBlogPost = (slug: string) => {
  return useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          blog_post_categories (
            blog_categories (*)
          ),
          blog_post_tags (
            blog_tags (*)
          )
        `)
        .eq('slug', slug)
        .single();
      
      if (error) throw error;
      
      // Transform the data
      const transformedData = {
        ...data,
        categories: data.blog_post_categories?.map((pc: any) => pc.blog_categories) || [],
        tags: data.blog_post_tags?.map((pt: any) => pt.blog_tags) || []
      };

      return transformedData as BlogPost;
    },
    enabled: !!slug,
  });
};

export const useCreateBlogPost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateBlogPostData) => {
      const slug = generateSlug(data.title);
      
      // Create the blog post
      const { data: post, error: postError } = await supabase
        .from('blog_posts')
        .insert({
          title: data.title,
          slug,
          content: data.content,
          excerpt: data.excerpt,
          featured_image_url: data.featured_image_url,
          meta_title: data.meta_title || data.title,
          meta_description: data.meta_description || data.excerpt,
          status: data.status,
          author_id: (await supabase.auth.getUser()).data.user?.id!,
          published_at: data.status === 'published' ? new Date().toISOString() : null
        })
        .select()
        .single();
      
      if (postError) throw postError;
      
      // Add categories
      if (data.category_ids && data.category_ids.length > 0) {
        const categoryInserts = data.category_ids.map(categoryId => ({
          post_id: post.id,
          category_id: categoryId
        }));
        
        const { error: categoryError } = await supabase
          .from('blog_post_categories')
          .insert(categoryInserts);
        
        if (categoryError) throw categoryError;
      }
      
      // Add tags
      if (data.tag_ids && data.tag_ids.length > 0) {
        const tagInserts = data.tag_ids.map(tagId => ({
          post_id: post.id,
          tag_id: tagId
        }));
        
        const { error: tagError } = await supabase
          .from('blog_post_tags')
          .insert(tagInserts);
        
        if (tagError) throw tagError;
      }
      
      return post;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      toast.success("Blog príspevok bol vytvorený");
    },
    onError: (error) => {
      console.error("Error creating blog post:", error);
      toast.error("Chyba pri vytváraní príspevku");
    },
  });
};

export const useUpdateBlogPost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: UpdateBlogPostData) => {
      const updateData: any = { ...data };
      delete updateData.id;
      delete updateData.category_ids;
      delete updateData.tag_ids;
      
      if (updateData.title) {
        updateData.slug = generateSlug(updateData.title);
      }
      
      if (updateData.status === 'published' && !updateData.published_at) {
        updateData.published_at = new Date().toISOString();
      }
      
      const { data: post, error: postError } = await supabase
        .from('blog_posts')
        .update(updateData)
        .eq('id', data.id)
        .select()
        .single();
      
      if (postError) throw postError;
      
      // Update categories if provided
      if (data.category_ids !== undefined) {
        // Remove existing categories
        await supabase
          .from('blog_post_categories')
          .delete()
          .eq('post_id', data.id);
        
        // Add new categories
        if (data.category_ids.length > 0) {
          const categoryInserts = data.category_ids.map(categoryId => ({
            post_id: data.id,
            category_id: categoryId
          }));
          
          const { error: categoryError } = await supabase
            .from('blog_post_categories')
            .insert(categoryInserts);
          
          if (categoryError) throw categoryError;
        }
      }
      
      // Update tags if provided
      if (data.tag_ids !== undefined) {
        // Remove existing tags
        await supabase
          .from('blog_post_tags')
          .delete()
          .eq('post_id', data.id);
        
        // Add new tags
        if (data.tag_ids.length > 0) {
          const tagInserts = data.tag_ids.map(tagId => ({
            post_id: data.id,
            tag_id: tagId
          }));
          
          const { error: tagError } = await supabase
            .from('blog_post_tags')
            .insert(tagInserts);
          
          if (tagError) throw tagError;
        }
      }
      
      return post;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['blog-post'] });
      toast.success("Blog príspevok bol aktualizovaný");
    },
    onError: (error) => {
      console.error("Error updating blog post:", error);
      toast.error("Chyba pri aktualizácii príspevku");
    },
  });
};

export const useDeleteBlogPost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      toast.success("Blog príspevok bol zmazaný");
    },
    onError: (error) => {
      console.error("Error deleting blog post:", error);
      toast.error("Chyba pri mazaní príspevku");
    },
  });
};

// Categories Hooks
export const useBlogCategories = () => {
  return useQuery({
    queryKey: ['blog-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as BlogCategory[];
    },
  });
};

// Tags Hooks
export const useBlogTags = () => {
  return useQuery({
    queryKey: ['blog-tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_tags')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as BlogTag[];
    },
  });
};

// Increment post view count
export const useIncrementPostView = () => {
  return useMutation({
    mutationFn: async (postId: string) => {
      // Get current view count and increment it
      const { data: post, error: fetchError } = await supabase
        .from('blog_posts')
        .select('view_count')
        .eq('id', postId)
        .single();
      
      if (fetchError || !post) {
        throw fetchError || new Error('Post not found');
      }
      
      // Update with incremented view count
      const { error: updateError } = await supabase
        .from('blog_posts')
        .update({ view_count: post.view_count + 1 })
        .eq('id', postId);
      
      if (updateError) throw updateError;
    },
  });
};
