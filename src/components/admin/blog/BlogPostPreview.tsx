
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BlogPostPreviewProps {
  title: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  status: string;
  onClose: () => void;
}

const BlogPostPreview: React.FC<BlogPostPreviewProps> = ({
  title,
  content,
  excerpt,
  featuredImage,
  status,
  onClose,
}) => {
  // Simple markdown to HTML conversion for preview
  const formatContent = (text: string) => {
    return text
      .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mb-4">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-semibold mb-3">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-semibold mb-2">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline">$1</a>')
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto my-4 rounded-lg" />')
      .replace(/^\- (.*$)/gm, '<li>$1</li>')
      .replace(/^(\d+)\. (.*$)/gm, '<li>$1. $2</li>')
      .replace(/\n/g, '<br />');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Náhľad príspevku</h2>
            <Badge variant={status === 'published' ? 'default' : 'secondary'}>
              {status === 'published' ? 'Publikovaný' : 'Koncept'}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6">
          <article className="prose prose-lg max-w-none">
            {featuredImage && (
              <img
                src={featuredImage}
                alt={title}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
            )}
            
            <h1 className="text-3xl font-bold mb-4">{title}</h1>
            
            {excerpt && (
              <p className="text-xl text-gray-600 mb-6 italic">{excerpt}</p>
            )}
            
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: formatContent(content) }}
            />
          </article>
        </div>
      </div>
    </div>
  );
};

export default BlogPostPreview;
