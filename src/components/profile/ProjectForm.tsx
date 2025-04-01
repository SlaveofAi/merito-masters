
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Project } from "./ProjectCard";

interface ProjectFormProps {
  onSubmit: (title: string, description: string, images: File[]) => Promise<void>;
  onCancel: () => void;
  initialData?: Project;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // Populate the form with initialData if provided (for editing)
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || "");
      
      // We can't directly set the images from initialData because they're already uploaded
      // Instead, we'll just set the preview URLs for display
      if (initialData.images && initialData.images.length > 0) {
        setPreviewUrls(initialData.images.map(img => img.image_url));
      }
    }
  }, [initialData]);

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setImages([...images, ...newImages]);
      
      // Create preview URLs for the new images
      const newPreviewUrls = newImages.map(file => URL.createObjectURL(file));
      setPreviewUrls([...previewUrls, ...newPreviewUrls]);
    }
  };

  const removeImage = (index: number) => {
    // If we're editing and there are existing images from initialData,
    // we need to distinguish between existing images and newly added ones
    if (initialData && index < (initialData.images?.length || 0)) {
      // For existing images, just remove from the preview
      const newPreviewUrls = [...previewUrls];
      newPreviewUrls.splice(index, 1);
      setPreviewUrls(newPreviewUrls);
    } else {
      // For new images, remove from both images array and preview
      const newImageIndex = initialData ? index - (initialData.images?.length || 0) : index;
      const newImages = [...images];
      
      // Revoke the preview URL to prevent memory leaks
      if (!initialData || index >= initialData.images.length) {
        URL.revokeObjectURL(previewUrls[index]);
      }
      
      newImages.splice(newImageIndex, 1);
      setImages(newImages);
      
      const newPreviewUrls = [...previewUrls];
      newPreviewUrls.splice(index, 1);
      setPreviewUrls(newPreviewUrls);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title) {
      toast.error("Zadajte názov projektu");
      return;
    }
    
    if (images.length === 0 && (!initialData || previewUrls.length === 0)) {
      toast.error("Pridajte aspoň jeden obrázok");
      return;
    }
    
    setUploading(true);
    try {
      await onSubmit(title, description, images);
      
      // Clean up preview URLs
      previewUrls.forEach(url => {
        // Only revoke URLs that start with blob: to avoid revoking server URLs
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
      
      // Reset form
      setTitle("");
      setDescription("");
      setImages([]);
      setPreviewUrls([]);
    } catch (error) {
      console.error("Error submitting project:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1">
          Názov projektu *
        </label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Napr. Rekonštrukcia kúpeľne"
          required
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Popis projektu
        </label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Popíšte váš projekt, použité materiály, postupy..."
          rows={4}
        />
      </div>
      
      <div>
        <label htmlFor="project-images" className="block text-sm font-medium mb-2">
          Fotografie projektu *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
          {previewUrls.map((url, index) => (
            <div key={index} className="relative group aspect-square">
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover rounded-md"
              />
              <button
                type="button"
                className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
              >
                &times;
              </button>
            </div>
          ))}
          
          <label
            htmlFor="project-images"
            className="border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center p-2 cursor-pointer aspect-square hover:bg-gray-50 transition-colors"
          >
            <UploadCloud className="h-8 w-8 text-gray-400 mb-1" />
            <span className="text-sm text-gray-500">Pridať fotku</span>
          </label>
        </div>
        
        <input
          id="project-images"
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleImagesChange}
        />
      </div>
      
      <div className="flex justify-end space-x-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={uploading}>
          Zrušiť
        </Button>
        <Button type="submit" disabled={uploading}>
          {uploading ? "Nahrávam..." : initialData ? "Upraviť projekt" : "Uložiť projekt"}
        </Button>
      </div>
    </form>
  );
};

export default ProjectForm;
