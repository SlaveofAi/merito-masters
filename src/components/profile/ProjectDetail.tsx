
import React, { useState } from 'react';
import { Project } from './ProjectCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import { Edit, Trash2, Calendar, Wrench, ArrowLeft, ArrowRight } from 'lucide-react';
import { formatDate } from '@/utils/dateUtils';
import ProjectImageLightbox from './ProjectImageLightbox';

interface ProjectDetailProps {
  project: Project;
  onEdit?: () => void;
  onDelete?: (imageId: string) => void;
  isCurrentUser: boolean;
  nextProject: () => void;
  previousProject: () => void;
  deletingImage: string | null;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({
  project,
  onEdit,
  onDelete,
  isCurrentUser,
  nextProject,
  previousProject,
  deletingImage
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <Card className="bg-white rounded-lg overflow-hidden border border-border/50 shadow-sm">
      <div className="aspect-video w-full relative">
        <Carousel className="w-full h-full">
          <CarouselContent>
            {project.images.map((image, index) => (
              <CarouselItem key={index}>
                <div 
                  className="w-full aspect-video relative cursor-zoom-in"
                  onClick={() => openLightbox(index)}
                >
                  <img
                    src={image.image_url}
                    alt={`Project image ${index + 1}`}
                    className="w-full h-full object-contain"
                  />
                  {isCurrentUser && (
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-70 hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete && onDelete(image.id);
                      }}
                      disabled={deletingImage === image.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </Carousel>
        
        <div className="absolute bottom-4 left-4 right-4 flex justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-white/80 backdrop-blur-sm"
            onClick={previousProject}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Predchádzajúci
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-white/80 backdrop-blur-sm"
            onClick={nextProject}
          >
            Nasledujúci
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
      
      <CardHeader className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold mb-1">{project.title}</CardTitle>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{formatDate(project.created_at)}</span>
              </div>
              {project.projectType && (
                <div className="flex items-center">
                  <Wrench className="h-4 w-4 mr-1" />
                  <span>{project.projectType}</span>
                </div>
              )}
            </div>
          </div>
          
          {isCurrentUser && onEdit && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onEdit}
            >
              <Edit className="h-4 w-4 mr-2" />
              Upraviť
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="px-6 pb-6">
        <CardDescription className="text-base whitespace-pre-line">
          {project.description}
        </CardDescription>
        
        <div className="grid grid-cols-4 gap-2 mt-6">
          {project.images.map((image, index) => (
            <div 
              key={index}
              className="aspect-square rounded-md overflow-hidden cursor-pointer hover:opacity-90 transition-all border border-border/50"
              onClick={() => openLightbox(index)}
            >
              <img
                src={image.image_url}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </CardContent>
      
      {lightboxOpen && (
        <ProjectImageLightbox
          images={project.images}
          startIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </Card>
  );
};

export default ProjectDetail;
