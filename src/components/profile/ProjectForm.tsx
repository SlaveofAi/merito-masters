
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UploadCloud } from "lucide-react";
import { toast } from "sonner";

interface ProjectFormProps {
  onSubmit: (title: string, description: string, images: File[]) => Promise<void>;
  onCancel: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ onSubmit, onCancel }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

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
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
    
    // Revoke the preview URL to prevent memory leaks
    URL.revokeObjectURL(previewUrls[index]);
    const newPreviewUrls = [...previewUrls];
    newPreviewUrls.splice(index, 1);
    setPreviewUrls(newPreviewUrls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title) {
      toast.error("Zadajte názov projektu");
      return;
    }
    
    if (images.length === 0) {
      toast.error("Pridajte aspoň jeden obrázok");
      return;
    }
    
    setUploading(true);
    try {
      await onSubmit(title, description, images);
      
      // Clean up preview URLs
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      
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
          {uploading ? "Nahrávam..." : "Uložiť projekt"}
        </Button>
      </div>
    </form>
  );
};

export default ProjectForm;
