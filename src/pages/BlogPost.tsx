
import React, { useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useBlogPost, useIncrementPostView } from "@/hooks/useBlog";
import { Calendar, Eye, Heart, ArrowLeft, Share2 } from "lucide-react";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import { toast } from "sonner";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, error } = useBlogPost(slug!);
  const incrementViewMutation = useIncrementPostView();

  useEffect(() => {
    if (post && post.status === 'published') {
      incrementViewMutation.mutate(post.id);
    }
  }, [post?.id]);

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.excerpt,
          url: url,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Link bol skopírovaný do schránky");
      } catch (error) {
        toast.error("Nepodarilo sa skopírovať link");
      }
    }
  };

  const generateMetaTags = () => {
    if (!post) return null;
    
    const title = post.meta_title || post.title;
    const description = post.meta_description || post.excerpt || '';
    const image = post.featured_image_url || '';
    const url = window.location.href;
    
    return (
      <>
        <title>{title} | Majstri Blog</title>
        <meta name="description" content={description} />
        
        {/* Open Graph */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={image} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="article" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={image} />
      </>
    );
  };

  useEffect(() => {
    if (post) {
      // Update document title and meta tags
      const metaTags = generateMetaTags();
      if (metaTags) {
        // You would typically use a library like react-helmet for this
        document.title = `${post.meta_title || post.title} | Majstri Blog`;
      }
    }
  }, [post]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Načítavanie príspevku...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return <Navigate to="/blog" replace />;
  }

  if (post.status !== 'published') {
    return <Navigate to="/blog" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {generateMetaTags()}
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back to Blog */}
        <div className="mb-6">
          <Link 
            to="/blog"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Späť na blog
          </Link>
        </div>

        <Card>
          <CardContent className="p-0">
            {/* Featured Image */}
            {post.featured_image_url && (
              <div className="aspect-video relative overflow-hidden rounded-t-lg">
                <img
                  src={post.featured_image_url}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="p-8">
              {/* Categories */}
              {post.categories && post.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.categories.map(category => (
                    <Badge 
                      key={category.id} 
                      variant="outline"
                      style={{ borderColor: category.color }}
                    >
                      {category.name}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {post.title}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-6 pb-6 border-b">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {format(new Date(post.published_at || post.created_at), 'dd. MMMM yyyy', { locale: sk })}
                </div>
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  {post.view_count} zobrazení
                </div>
                <div className="flex items-center">
                  <Heart className="h-4 w-4 mr-1" />
                  {post.like_count} páčilo sa
                </div>
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-1" />
                  Zdieľať
                </Button>
              </div>

              {/* Content */}
              <div className="prose prose-lg max-w-none">
                {post.content.split('\n').map((paragraph, index) => (
                  paragraph.trim() ? (
                    <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                      {paragraph}
                    </p>
                  ) : (
                    <br key={index} />
                  )
                ))}
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-8 pt-6 border-t">
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Tagy:</h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map(tag => (
                      <Badge key={tag.id} variant="secondary">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Related Posts or Comments could go here */}
      </div>
    </div>
  );
};

export default BlogPost;
