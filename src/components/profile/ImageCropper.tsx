
import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ZoomIn, ZoomOut } from "lucide-react";
import { getCroppedImg } from "@/utils/imageCrop";

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedArea: any) => void;
  onCancel: () => void;
  aspectRatio?: number;
}

const ImageCropper: React.FC<ImageCropperProps> = ({ 
  imageSrc, 
  onCropComplete, 
  onCancel,
  aspectRatio = 1
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropChange = (location: { x: number; y: number }) => {
    setCrop(location);
  };

  const onZoomChange = (value: number[]) => {
    setZoom(value[0]);
  };

  const handleCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedImage);
    } catch (error) {
      console.error('Error getting cropped image:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg overflow-hidden max-w-4xl w-full">
        <div className="p-4 border-b">
          <h3 className="text-lg font-medium">Upraviť fotografiu</h3>
        </div>
        
        <div className="relative h-[500px] w-full">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={onCropChange}
            onCropComplete={handleCropComplete}
            onZoomChange={setZoom}
            cropSize={{ width: 400, height: 400 }}
          />
        </div>
        
        <div className="p-4 flex flex-col space-y-4">
          <div className="flex items-center space-x-2">
            <ZoomOut className="h-4 w-4 text-gray-500" />
            <Slider 
              value={[zoom]} 
              min={1} 
              max={3} 
              step={0.1} 
              onValueChange={onZoomChange} 
              className="flex-1" 
            />
            <ZoomIn className="h-4 w-4 text-gray-500" />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onCancel}>
              Zrušiť
            </Button>
            <Button onClick={handleConfirm}>
              Potvrdiť
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
