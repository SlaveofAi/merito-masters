
import React, { useState } from 'react';
import { X, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from "../ui/button";
import { ProjectImage } from './ProjectCard';

interface ProjectImageLightboxProps {
  images: ProjectImage[];
  startIndex: number;
  onClose: () => void;
}

const ProjectImageLightbox: React.FC<ProjectImageLightboxProps> = ({ 
  images, 
  startIndex, 
  onClose 
}) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  
  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };
  
  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };
  
  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
  
  return (
    <div 
      className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center animate-fade-in"
      onClick={onClose}
    >
      <div className="absolute top-4 right-4">
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full bg-black/20 text-white border-white/20 hover:bg-black/40"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div 
        className="relative max-w-4xl max-h-[80vh] w-full h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {images.length > 0 && (
          <img
            src={images[currentIndex].image_url}
            alt={`Project image ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain"
          />
        )}
        
        {images.length > 1 && (
          <>
            <Button 
              variant="outline" 
              size="icon" 
              className="absolute left-4 top-1/2 transform -translate-y-1/2 rounded-full bg-black/20 text-white border-white/20 hover:bg-black/40"
              onClick={handlePrevious}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="icon" 
              className="absolute right-4 top-1/2 transform -translate-y-1/2 rounded-full bg-black/20 text-white border-white/20 hover:bg-black/40"
              onClick={handleNext}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
      
      <div className="absolute bottom-8 flex gap-2 justify-center">
        {images.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full ${
              index === currentIndex ? 'bg-white' : 'bg-white/40'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(index);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ProjectImageLightbox;
