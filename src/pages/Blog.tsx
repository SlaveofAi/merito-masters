
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useBlogPosts, useBlogCategories, useBlogTags } from "@/hooks/useBlog";
import { Search, Calendar, Eye, Heart } from "lucide-react";
import { format } from "date-fns";
import { sk } from "date-fns/locale";

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const { data: posts, isLoading } = useBlogPosts('published');
  const { data: categories } = useBlogCategories();
  const { data: tags } = useBlogTags();

  const filteredPosts = posts?.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (post.excerpt && post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = !selectedCategory || 
                           post.categories?.some(cat => cat.id === selectedCategory);
    
    const matchesTag = !selectedTag ||
                      post.tags?.some(tag => tag.id === selectedTag);
    
    return matchesSearch && matchesCategory && matchesTag;
  }) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Majstri Blog
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Najnovšie správy, tipy a príbehy zo sveta remeselníkov
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search */}
            <Card>
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Hľadať príspevky..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">Kategórie</h3>
                <div className="space-y-2">
                  <Button
                    variant={selectedCategory === null ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedCategory(null)}
                  >
                    Všetky kategórie
                  </Button>
                  {categories?.map(category => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">Tagy</h3>
                <div className="flex flex-wrap gap-2">
                  {tags?.map(tag => (
                    <Badge
                      key={tag.id}
                      variant={selectedTag === tag.id ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setSelectedTag(selectedTag === tag.id ? null : tag.id)}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Načítavanie príspevkov...</p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Žiadne príspevky neboli nájdené.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredPosts.map(post => (
                  <Card key={post.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      {post.featured_image_url && (
                        <div className="aspect-video relative overflow-hidden rounded-t-lg">
                          <img
                            src={post.featured_image_url}
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      <div className="p-6">
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {format(new Date(post.published_at || post.created_at), 'dd.MM.yyyy', { locale: sk })}
                          </div>
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            {post.view_count}
                          </div>
                          <div className="flex items-center">
                            <Heart className="h-4 w-4 mr-1" />
                            {post.like_count}
                          </div>
                        </div>
                        
                        <h2 className="text-xl font-semibold mb-3 line-clamp-2">
                          <Link 
                            to={`/blog/${post.slug}`}
                            className="hover:text-blue-600 transition-colors"
                          >
                            {post.title}
                          </Link>
                        </h2>
                        
                        {post.excerpt && (
                          <p className="text-gray-600 mb-4 line-clamp-3">
                            {post.excerpt}
                          </p>
                        )}
                        
                        {post.categories && post.categories.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
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
                        
                        <Link 
                          to={`/blog/${post.slug}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Čítať viac →
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;
