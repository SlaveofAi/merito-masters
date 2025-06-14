
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RichTextEditor from "./RichTextEditor";
import FeaturedImageUploader from "./FeaturedImageUploader";
import BlogPostPreview from "./BlogPostPreview";
import { Save, Eye, Send } from "lucide-react";

interface BlogPost {
  id?: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  status: string;
  featured_image_url: string;
}

interface EnhancedBlogFormProps {
  post?: BlogPost | null;
  onSubmit: (formData: Omit<BlogPost, 'id'>) => Promise<void>;
  onCancel: () => void;
}

const EnhancedBlogForm: React.FC<EnhancedBlogFormProps> = ({
  post,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    title: post?.title || "",
    content: post?.content || "",
    excerpt: post?.excerpt || "",
    slug: post?.slug || "",
    status: post?.status || "draft",
    featured_image_url: post?.featured_image_url || "",
  });

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  // Update word count when content changes
  React.useEffect(() => {
    const words = formData.content.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [formData.content]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title)
    }));
  };

  const handleSubmit = async (status: string) => {
    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        status,
        slug: formData.slug || generateSlug(formData.title)
      });
    } finally {
      setLoading(false);
    }
  };

  const estimatedReadingTime = Math.ceil(wordCount / 200); // Average reading speed

  return (
    <>
      <form className="space-y-6">
        <Tabs defaultValue="write" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="write">Písanie</TabsTrigger>
            <TabsTrigger value="settings">Nastavenia</TabsTrigger>
            <TabsTrigger value="seo">SEO & Metadáta</TabsTrigger>
          </TabsList>

          <TabsContent value="write" className="space-y-6">
            <div>
              <Label htmlFor="title">Nadpis príspevku</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Zadajte nadpis príspevku..."
                className="text-lg font-semibold"
                required
              />
            </div>

            <RichTextEditor
              content={formData.content}
              onChange={(content) => setFormData(prev => ({ ...prev, content }))}
              onPreview={() => setIsPreviewOpen(true)}
            />

            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{wordCount} slov</span>
              <span>Odhadovaný čas čítania: {estimatedReadingTime} min</span>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Základné nastavenia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="slug">URL slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="url-slug-prispevku"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    URL: /blog/{formData.slug || 'url-slug-prispevku'}
                  </p>
                </div>

                <div>
                  <Label htmlFor="excerpt">Krátky popis (excerpt)</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                    rows={3}
                    placeholder="Krátky popis príspevku pre náhľady a vyhľadávače..."
                  />
                </div>

                <FeaturedImageUploader
                  currentImage={formData.featured_image_url}
                  onImageUpload={(url) => setFormData(prev => ({ ...prev, featured_image_url: url }))}
                  onImageRemove={() => setFormData(prev => ({ ...prev, featured_image_url: "" }))}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>SEO optimalizácia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Náhľad vo vyhľadávači</Label>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="text-blue-600 text-lg hover:underline cursor-pointer">
                      {formData.title || "Nadpis príspevku"}
                    </div>
                    <div className="text-green-700 text-sm">
                      majstri.com/blog/{formData.slug || 'url-slug'}
                    </div>
                    <div className="text-gray-600 text-sm mt-1">
                      {formData.excerpt || "Popis príspevku sa zobrazí tu..."}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Dĺžka nadpisu:</span>
                    <span className={`ml-2 ${formData.title.length > 60 ? 'text-red-500' : 'text-green-500'}`}>
                      {formData.title.length}/60
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Dĺžka popisu:</span>
                    <span className={`ml-2 ${formData.excerpt.length > 160 ? 'text-red-500' : 'text-green-500'}`}>
                      {formData.excerpt.length}/160
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-6 border-t">
          <div className="flex gap-2 flex-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPreviewOpen(true)}
              disabled={!formData.title || !formData.content}
            >
              <Eye className="w-4 h-4 mr-2" />
              Náhľad
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSubmit("draft")}
              disabled={loading || !formData.title || !formData.content}
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Ukladá sa...' : 'Uložiť koncept'}
            </Button>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Zrušiť
            </Button>
            
            <Button
              type="button"
              onClick={() => handleSubmit("published")}
              disabled={loading || !formData.title || !formData.content}
            >
              <Send className="w-4 h-4 mr-2" />
              {loading ? 'Publikuje sa...' : 'Publikovať'}
            </Button>
          </div>
        </div>
      </form>

      {isPreviewOpen && (
        <BlogPostPreview
          title={formData.title}
          content={formData.content}
          excerpt={formData.excerpt}
          featuredImage={formData.featured_image_url}
          status={formData.status}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </>
  );
};

export default EnhancedBlogForm;
