
import React, { useState } from 'react';
import Cropper from 'react-easy-crop';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ZoomIn, ZoomOut, Check, X } from "lucide-react";
import { getCroppedImg } from "@/utils/imageCrop";

interface ProjectImageEditorProps {
  imageSrc: string;
  onSave: (croppedImage: File) => void;
  onCancel: () => void;
}

const ProjectImageEditor: React.FC<ProjectImageEditorProps> = ({ imageSrc, onSave, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  const handleCropComplete = (_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleSave = async () => {
    try {
      setProcessing(true);
      if (!croppedAreaPixels) {
        throw new Error("No cropped area data");
      }
      
      // Get the cropped image as a Blob
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      
      // Convert blob to File for compatibility
      const croppedImageFile = new File([croppedImageBlob], 'project-image.jpg', { type: 'image/jpeg' });
      onSave(croppedImageFile);
    } catch (error) {
      console.error("Error saving cropped image:", error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-medium">Upraviť fotografiu projektu</h3>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="relative h-[500px] w-full">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={16 / 9}
            onCropChange={setCrop}
            onCropComplete={handleCropComplete}
            onZoomChange={setZoom}
          />
        </div>
        
        <div className="p-4 space-y-4">
          <div className="flex items-center space-x-2">
            <ZoomOut className="h-4 w-4 text-gray-500" />
            <Slider 
              value={[zoom]} 
              min={1} 
              max={3} 
              step={0.1} 
              onValueChange={(values) => setZoom(values[0])} 
              className="flex-1" 
            />
            <ZoomIn className="h-4 w-4 text-gray-500" />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onCancel} disabled={processing}>
              Zrušiť
            </Button>
            <Button onClick={handleSave} disabled={processing}>
              {processing ? "Spracovávam..." : "Potvrdiť"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectImageEditor;
