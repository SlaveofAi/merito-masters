
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBlogPosts, useDeleteBlogPost } from "@/hooks/useBlog";
import { BlogPost } from "@/types/blog";
import { Plus, Edit, Trash2, Eye, Search } from "lucide-react";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import BlogPostEditor from "@/components/blog/BlogPostEditor";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const BlogManagement = () => {
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: posts, isLoading } = useBlogPosts(statusFilter);
  const deletePostMutation = useDeleteBlogPost();

  const filteredPosts = posts?.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleCreateNew = () => {
    setEditingPost(null);
    setView('create');
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setView('edit');
  };

  const handleDelete = async (postId: string) => {
    await deletePostMutation.mutateAsync(postId);
  };

  const handleSave = () => {
    setView('list');
    setEditingPost(null);
  };

  const handleCancel = () => {
    setView('list');
    setEditingPost(null);
  };

  if (view === 'create' || view === 'edit') {
    return (
      <BlogPostEditor
        post={editingPost || undefined}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Blog Management</h1>
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          Nový príspevok
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Hľadať príspevky..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter podľa stavu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Všetky príspevky</SelectItem>
                <SelectItem value="published">Publikované</SelectItem>
                <SelectItem value="draft">Koncepty</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Posts List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">Načítavanie...</div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Žiadne príspevky neboli nájdené.</p>
          </div>
        ) : (
          filteredPosts.map(post => (
            <Card key={post.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold">{post.title}</h3>
                      <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                        {post.status === 'published' ? 'Publikované' : 'Koncept'}
                      </Badge>
                    </div>
                    
                    {post.excerpt && (
                      <p className="text-gray-600 mb-2 line-clamp-2">{post.excerpt}</p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>
                        Vytvorené: {format(new Date(post.created_at), 'dd.MM.yyyy HH:mm', { locale: sk })}
                      </span>
                      {post.published_at && (
                        <span>
                          Publikované: {format(new Date(post.published_at), 'dd.MM.yyyy HH:mm', { locale: sk })}
                        </span>
                      )}
                      <span>{post.view_count} zobrazení</span>
                      <span>{post.like_count} páčilo sa</span>
                    </div>
                    
                    {(post.categories && post.categories.length > 0) && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {post.categories.map(category => (
                          <Badge key={category.id} variant="outline" style={{ borderColor: category.color }}>
                            {category.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {post.status === 'published' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(post)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Zmazať príspevok</AlertDialogTitle>
                          <AlertDialogDescription>
                            Ste si istí, že chcete zmazať tento príspevok? Táto akcia sa nedá vrátiť späť.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Zrušiť</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(post.id)}>
                            Zmazať
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default BlogManagement;
