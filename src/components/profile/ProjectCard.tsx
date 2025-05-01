
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ProjectImage {
  id: string;
  image_url: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  created_at: string;
  images: ProjectImage[];
}

interface ProjectCardProps {
  project: Project;
  onSelect: (id: string) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isSelected: boolean;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ 
  project, 
  onSelect, 
  onEdit, 
  onDelete, 
  isSelected 
}) => {
  const handleClick = () => {
    onSelect(project.id);
  };

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? "ring-2 ring-primary" : ""
      }`}
      onClick={handleClick}
    >
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-base line-clamp-1">{project.title}</CardTitle>
      </CardHeader>
      
      <div className="aspect-video w-full overflow-hidden">
        {project.images.length > 0 ? (
          <img 
            src={project.images[0].image_url} 
            alt={project.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400">Žiadne obrázky</span>
          </div>
        )}
      </div>
      
      <CardContent className="p-3 pt-2">
        <CardDescription className="line-clamp-2 text-xs mb-2">
          {project.description}
        </CardDescription>
        
        {(onEdit || onDelete) && (
          <div className="flex justify-end gap-2 mt-2">
            {onEdit && (
              <Button 
                variant="ghost" 
                size="sm"
                className="h-7 w-7 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                <Edit className="h-3.5 w-3.5" />
                <span className="sr-only">Upraviť</span>
              </Button>
            )}
            
            {onDelete && (
              <Button 
                variant="ghost" 
                size="sm"
                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="sr-only">Odstrániť</span>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
