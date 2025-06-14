
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Eye, Search } from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";

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
}

const BlogManagement = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    slug: "",
    status: "draft",
    featured_image_url: "",
  });

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

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const slug = formData.slug || generateSlug(formData.title);
      const postData = {
        ...formData,
        slug,
        published_at: formData.status === 'published' ? new Date().toISOString() : null,
        author_id: (await supabase.auth.getUser()).data.user?.id || '',
      };

      if (editingPost) {
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', editingPost.id);
        
        if (error) throw error;
        toast.success('Príspevok bol úspešne upravený');
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .insert([postData]);
        
        if (error) throw error;
        toast.success('Príspevok bol úspešne vytvorený');
      }

      setIsDialogOpen(false);
      setEditingPost(null);
      setFormData({
        title: "",
        content: "",
        excerpt: "",
        slug: "",
        status: "draft",
        featured_image_url: "",
      });
      fetchPosts();
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error('Chyba pri ukladaní príspevku');
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || "",
      slug: post.slug,
      status: post.status,
      featured_image_url: post.featured_image_url || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Ste si istí, že chcete vymazať tento príspevok?')) return;

    try {
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
        <h1 className="text-2xl font-bold">Správa blogu</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingPost(null);
              setFormData({
                title: "",
                content: "",
                excerpt: "",
                slug: "",
                status: "draft",
                featured_image_url: "",
              });
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Nový príspevok
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPost ? 'Upraviť príspevok' : 'Nový príspevok'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Nadpis</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="slug">URL slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  placeholder="Automaticky vygenerované z nadpisu"
                />
              </div>

              <div>
                <Label htmlFor="excerpt">Krátky popis</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="content">Obsah</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  rows={10}
                  required
                />
              </div>

              <div>
                <Label htmlFor="featured_image">URL obrázka</Label>
                <Input
                  id="featured_image"
                  value={formData.featured_image_url}
                  onChange={(e) => setFormData({...formData, featured_image_url: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <Label htmlFor="status">Stav</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Koncept</SelectItem>
                    <SelectItem value="published">Publikovaný</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingPost ? 'Upraviť' : 'Vytvoriť'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Zrušiť
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
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
          <Card key={post.id}>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{post.title}</h3>
                    <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                      {post.status === 'published' ? 'Publikovaný' : 'Koncept'}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-2">{post.excerpt}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Vytvorené: {format(new Date(post.created_at), 'dd.MM.yyyy', { locale: sk })}</span>
                    <span>{post.view_count} zobrazení</span>
                    <span>{post.like_count} páči sa mi</span>
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
        <div className="text-center py-8">
          <p className="text-gray-500">Žiadne príspevky neboli nájdené.</p>
        </div>
      )}
    </div>
  );
};

export default BlogManagement;
