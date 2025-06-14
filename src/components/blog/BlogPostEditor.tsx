
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateBlogPost, useUpdateBlogPost, useBlogCategories, useBlogTags } from "@/hooks/useBlog";
import { CreateBlogPostData, UpdateBlogPostData, BlogPost } from "@/types/blog";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X, Save, Eye } from "lucide-react";
import { toast } from "sonner";

interface BlogPostEditorProps {
  post?: BlogPost;
  onSave?: () => void;
  onCancel?: () => void;
}

const BlogPostEditor: React.FC<BlogPostEditorProps> = ({ post, onSave, onCancel }) => {
  const [formData, setFormData] = useState<CreateBlogPostData>({
    title: "",
    content: "",
    excerpt: "",
    featured_image_url: "",
    meta_title: "",
    meta_description: "",
    status: "draft",
    category_ids: [],
    tag_ids: []
  });
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const createPostMutation = useCreateBlogPost();
  const updatePostMutation = useUpdateBlogPost();
  const { data: categories } = useBlogCategories();
  const { data: tags } = useBlogTags();

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title,
        content: post.content,
        excerpt: post.excerpt || "",
        featured_image_url: post.featured_image_url || "",
        meta_title: post.meta_title || "",
        meta_description: post.meta_description || "",
        status: post.status,
        category_ids: post.categories?.map(c => c.id) || [],
        tag_ids: post.tags?.map(t => t.id) || []
      });
      setSelectedCategories(post.categories?.map(c => c.id) || []);
      setSelectedTags(post.tags?.map(t => t.id) || []);
    }
  }, [post]);

  const handleInputChange = (field: keyof CreateBlogPostData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `featured/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

      handleInputChange('featured_image_url', data.publicUrl);
      toast.success("Obrázok bol nahraný");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Chyba pri nahrávaní obrázka");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (status: 'draft' | 'published') => {
    const dataToSave = {
      ...formData,
      status,
      category_ids: selectedCategories,
      tag_ids: selectedTags
    };

    if (post) {
      await updatePostMutation.mutateAsync({ ...dataToSave, id: post.id } as UpdateBlogPostData);
    } else {
      await createPostMutation.mutateAsync(dataToSave);
    }
    
    onSave?.();
  };

  const addCategory = (categoryId: string) => {
    if (!selectedCategories.includes(categoryId)) {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const removeCategory = (categoryId: string) => {
    setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
  };

  const addTag = (tagId: string) => {
    if (!selectedTags.includes(tagId)) {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const removeTag = (tagId: string) => {
    setSelectedTags(selectedTags.filter(id => id !== tagId));
  };

  const isLoading = createPostMutation.isPending || updatePostMutation.isPending;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{post ? 'Upraviť príspevok' : 'Nový príspevok'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title */}
          <div>
            <Label htmlFor="title">Názov</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Zadajte názov príspevku"
            />
          </div>

          {/* Featured Image */}
          <div>
            <Label htmlFor="featured-image">Hlavný obrázok</Label>
            <div className="space-y-2">
              {formData.featured_image_url && (
                <div className="relative inline-block">
                  <img 
                    src={formData.featured_image_url} 
                    alt="Featured" 
                    className="w-48 h-32 object-cover rounded"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1"
                    onClick={() => handleInputChange('featured_image_url', '')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
                {uploading && <span className="text-sm text-gray-500">Nahrávanie...</span>}
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            <Label htmlFor="content">Obsah</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="Zadajte obsah príspevku"
              rows={12}
              className="font-mono"
            />
          </div>

          {/* Excerpt */}
          <div>
            <Label htmlFor="excerpt">Výňatok</Label>
            <Textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => handleInputChange('excerpt', e.target.value)}
              placeholder="Krátky popis príspevku"
              rows={3}
            />
          </div>

          {/* Categories */}
          <div>
            <Label>Kategórie</Label>
            <div className="space-y-2">
              <Select onValueChange={addCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Vyberte kategóriu" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.filter(c => !selectedCategories.includes(c.id)).map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-2">
                {selectedCategories.map(categoryId => {
                  const category = categories?.find(c => c.id === categoryId);
                  return category ? (
                    <Badge key={categoryId} variant="secondary">
                      {category.name}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-auto p-0"
                        onClick={() => removeCategory(categoryId)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label>Tagy</Label>
            <div className="space-y-2">
              <Select onValueChange={addTag}>
                <SelectTrigger>
                  <SelectValue placeholder="Vyberte tag" />
                </SelectTrigger>
                <SelectContent>
                  {tags?.filter(t => !selectedTags.includes(t.id)).map(tag => (
                    <SelectItem key={tag.id} value={tag.id}>
                      {tag.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map(tagId => {
                  const tag = tags?.find(t => t.id === tagId);
                  return tag ? (
                    <Badge key={tagId} variant="outline">
                      {tag.name}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-auto p-0"
                        onClick={() => removeTag(tagId)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          </div>

          {/* SEO Fields */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">SEO nastavenia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="meta-title">Meta Title</Label>
                <Input
                  id="meta-title"
                  value={formData.meta_title}
                  onChange={(e) => handleInputChange('meta_title', e.target.value)}
                  placeholder="SEO názov (prázdne = použije sa názov príspevku)"
                />
              </div>
              <div>
                <Label htmlFor="meta-description">Meta Description</Label>
                <Textarea
                  id="meta-description"
                  value={formData.meta_description}
                  onChange={(e) => handleInputChange('meta_description', e.target.value)}
                  placeholder="SEO popis (prázdne = použije sa výňatok)"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={onCancel}>
              Zrušiť
            </Button>
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={() => handleSave('draft')}
                disabled={isLoading}
              >
                <Save className="mr-2 h-4 w-4" />
                Uložiť ako koncept
              </Button>
              <Button
                onClick={() => handleSave('published')}
                disabled={isLoading}
              >
                <Eye className="mr-2 h-4 w-4" />
                Publikovať
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogPostEditor;
