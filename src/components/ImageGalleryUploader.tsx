
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Upload, Edit } from 'lucide-react';
import ImageCropper from './profile/ImageCropper';

interface ImageGalleryUploaderProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  maxImages?: number;
}

const ImageGalleryUploader: React.FC<ImageGalleryUploaderProps> = ({
  images,
  onImagesChange,
  maxImages = 5
}) => {
  const [editingImage, setEditingImage] = useState<{ file: File; index: number } | null>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        return false;
      }
      return true;
    });

    const totalImages = images.length + validFiles.length;
    if (totalImages > maxImages) {
      const remainingSlots = maxImages - images.length;
      const newImages = [...images, ...validFiles.slice(0, remainingSlots)];
      onImagesChange(newImages);
    } else {
      const newImages = [...images, ...validFiles];
      onImagesChange(newImages);
    }
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const handleCropComplete = (croppedBlob: Blob, index: number) => {
    const originalFile = images[index];
    const croppedFile = new File([croppedBlob], originalFile.name, {
      type: 'image/jpeg'
    });
    
    const newImages = [...images];
    newImages[index] = croppedFile;
    onImagesChange(newImages);
    setEditingImage(null);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative group">
            <img
              src={URL.createObjectURL(image)}
              alt={`Upload ${index + 1}`}
              className="w-full h-32 object-cover rounded border"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => setEditingImage({ file: image, index })}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={() => removeImage(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        
        {images.length < maxImages && (
          <div className="border-2 border-dashed border-gray-300 rounded h-32 flex items-center justify-center">
            <label htmlFor="multiple-image-upload" className="cursor-pointer text-center">
              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">
                Pridať obrázok ({images.length}/{maxImages})
              </span>
              <input
                id="multiple-image-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>

      {editingImage && (
        <ImageCropper
          imageSrc={URL.createObjectURL(editingImage.file)}
          onCropComplete={(croppedBlob) => handleCropComplete(croppedBlob, editingImage.index)}
          onCancel={() => setEditingImage(null)}
          aspectRatio={1}
        />
      )}
    </div>
  );
};

export default ImageGalleryUploader;
