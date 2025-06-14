
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import { Search, Calendar, Eye, Heart } from "lucide-react";
import Layout from "@/components/Layout";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string | null;
  slug: string;
  featured_image_url: string | null;
  view_count: number;
  like_count: number;
  created_at: string;
  published_at: string;
}

interface BlogCategory {
  id: string;
  name: string;
  color: string;
}

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (post.excerpt && post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <p>Načítavam príspevky...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Blog Majstri.com</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Užitočné tipy, návody a aktuality zo sveta remesiel a stavebníctva
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Vyhľadať príspevky..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {categories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                Všetky kategórie
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  style={{
                    backgroundColor: selectedCategory === category.id ? category.color : undefined,
                    borderColor: category.color,
                  }}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Posts Grid */}
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <Link to={`/blog/${post.slug}`}>
                  {post.featured_image_url && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={post.featured_image_url}
                        alt={post.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-2 line-clamp-2 hover:text-primary transition-colors">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(post.published_at), 'dd.MM.yyyy', { locale: sk })}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {post.view_count}
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {post.like_count}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {searchTerm ? 'Žiadne príspevky neboli nájdené pre váš vyhľadávací výraz.' : 'Zatiaľ neboli publikované žiadne príspevky.'}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Blog;
