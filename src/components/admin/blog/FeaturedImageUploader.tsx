
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { uploadFeaturedImage } from "@/utils/blogImageUpload";
import { toast } from "sonner";

interface FeaturedImageUploaderProps {
  currentImage?: string;
  onImageUpload: (url: string) => void;
  onImageRemove: () => void;
}

const FeaturedImageUploader: React.FC<FeaturedImageUploaderProps> = ({
  currentImage,
  onImageUpload,
  onImageRemove,
}) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const imageUrl = await uploadFeaturedImage(file);
      if (imageUrl) {
        onImageUpload(imageUrl);
        toast.success("Hlavný obrázok bol úspešne nahratý");
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    onImageRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <Label>Hlavný obrázok</Label>
      
      {currentImage ? (
        <div className="relative inline-block">
          <img
            src={currentImage}
            alt="Featured"
            className="w-full max-w-md h-48 object-cover rounded-lg border"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div
          className="w-full max-w-md h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
          onClick={handleUploadClick}
        >
          <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
          <p className="text-gray-500 text-center">
            Kliknite pre nahratie hlavného obrázka
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleUploadClick}
          disabled={uploading}
        >
          <Upload className="w-4 h-4 mr-2" />
          {uploading ? 'Nahráva sa...' : currentImage ? 'Zmeniť obrázok' : 'Nahrať obrázok'}
        </Button>
        
        {currentImage && (
          <Button
            type="button"
            variant="outline"
            onClick={handleRemove}
          >
            <X className="w-4 h-4 mr-2" />
            Odstrániť
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default FeaturedImageUploader;
