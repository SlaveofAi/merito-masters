
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Eye, Search, FileText } from "lucide-react";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import EnhancedBlogForm from "@/components/admin/blog/EnhancedBlogForm";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  slug: string;
  status: string;
  featured_image_url: string | null;
  view_count: number;
  like_count: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  categories?: string[];
}

const BlogManagement = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Chyba pri načítavaní príspevkov');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (formData: Omit<BlogPost, 'id'>) => {
    try {
      const postData = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt,
        slug: formData.slug,
        status: formData.status,
        featured_image_url: formData.featured_image_url,
        published_at: formData.status === 'published' ? new Date().toISOString() : null,
        author_id: (await supabase.auth.getUser()).data.user?.id || '',
      };

      let postId: string;

      if (editingPost) {
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', editingPost.id);
        
        if (error) throw error;
        postId = editingPost.id;
        toast.success('Príspevok bol úspešne upravený');
      } else {
        const { data: newPost, error } = await supabase
          .from('blog_posts')
          .insert([postData])
          .select()
          .single();
        
        if (error) throw error;
        postId = newPost.id;
        toast.success('Príspevok bol úspešne vytvorený');
      }

      // Handle categories
      if (formData.categories && formData.categories.length > 0) {
        // First, remove existing category associations
        await supabase
          .from('blog_post_categories')
          .delete()
          .eq('post_id', postId);

        // Then add new category associations
        const categoryData = formData.categories.map(categoryId => ({
          post_id: postId,
          category_id: categoryId
        }));

        const { error: categoryError } = await supabase
          .from('blog_post_categories')
          .insert(categoryData);

        if (categoryError) {
          console.error('Error saving categories:', categoryError);
          toast.error('Chyba pri ukladaní kategórií');
        }
      }

      setIsDialogOpen(false);
      setEditingPost(null);
      fetchPosts();
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error('Chyba pri ukladaní príspevku');
    }
  };

  const handleEdit = async (post: BlogPost) => {
    // Fetch categories for this post
    const { data: postCategories } = await supabase
      .from('blog_post_categories')
      .select('category_id')
      .eq('post_id', post.id);

    const categories = postCategories?.map(pc => pc.category_id) || [];
    
    setEditingPost({
      ...post,
      categories
    });
    setIsDialogOpen(true);
  };

  const handleNewPost = () => {
    setEditingPost(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Ste si istí, že chcete vymazať tento príspevok?')) return;

    try {
      // Delete category associations first
      await supabase
        .from('blog_post_categories')
        .delete()
        .eq('post_id', id);

      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Príspevok bol úspešne vymazaný');
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Chyba pri mazaní príspevku');
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || post.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div className="flex justify-center items-center h-64">Načítavam...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Správa blogu</h1>
          <p className="text-gray-600">Vytvárajte a spravujte príspevky na blog</p>
        </div>
        <Button onClick={handleNewPost} className="bg-primary">
          <Plus className="w-4 h-4 mr-2" />
          Nový príspevok
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{posts.length}</p>
                <p className="text-sm text-gray-600">Celkom príspevkov</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full" />
              <div>
                <p className="text-2xl font-bold">{posts.filter(p => p.status === 'published').length}</p>
                <p className="text-sm text-gray-600">Publikované</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded-full" />
              <div>
                <p className="text-2xl font-bold">{posts.filter(p => p.status === 'draft').length}</p>
                <p className="text-sm text-gray-600">Koncepty</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{posts.reduce((sum, p) => sum + p.view_count, 0)}</p>
                <p className="text-sm text-gray-600">Celkom zobrazení</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Vyhľadať príspevky..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Všetky stavy</SelectItem>
            <SelectItem value="draft">Koncepty</SelectItem>
            <SelectItem value="published">Publikované</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Posts List */}
      <div className="grid gap-4">
        {filteredPosts.map((post) => (
          <Card key={post.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    {post.featured_image_url && (
                      <img
                        src={post.featured_image_url}
                        alt={post.title}
                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold line-clamp-1">{post.title}</h3>
                        <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                          {post.status === 'published' ? 'Publikovaný' : 'Koncept'}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-2 line-clamp-2">{post.excerpt}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Vytvorené: {format(new Date(post.created_at), 'dd.MM.yyyy', { locale: sk })}</span>
                        <span>{post.view_count} zobrazení</span>
                        <span>{post.like_count} páči sa mi</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {post.status === 'published' && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                        <Eye className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => handleEdit(post)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(post.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {searchTerm ? 'Žiadne príspevky neboli nájdené pre váš vyhľadávací výraz.' : 'Zatiaľ neboli vytvorené žiadne príspevky.'}
          </p>
          {!searchTerm && (
            <Button onClick={handleNewPost} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Vytvoriť prvý príspevok
            </Button>
          )}
        </div>
      )}

      {/* Enhanced Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {editingPost ? 'Upraviť príspevok' : 'Nový príspevok'}
            </DialogTitle>
          </DialogHeader>
          <EnhancedBlogForm
            post={editingPost}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlogManagement;
