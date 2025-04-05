
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Edit, Trash2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils/dateUtils";

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
  projectType?: string;
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
      className={`cursor-pointer transition-all hover:shadow-md hover:translate-y-[-2px] ${
        isSelected ? "ring-2 ring-primary bg-gray-50" : ""
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
            className="w-full h-full object-cover rounded-sm"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-sm">
            <span className="text-gray-400">Žiadne obrázky</span>
          </div>
        )}
      </div>
      
      <CardContent className="p-3 pt-2">
        <CardDescription className="line-clamp-2 text-xs mb-2">
          {project.description}
        </CardDescription>
        
        <div className="flex items-center text-xs text-gray-500 mt-2">
          <Calendar className="h-3 w-3 mr-1" />
          <span>{formatDate(project.created_at)}</span>
        </div>
      </CardContent>
      
      <CardFooter className="p-2 pt-0 flex justify-end">
        {(onEdit || onDelete) && (
          <div className="flex gap-2">
            {onEdit && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                <Edit className="h-3 w-3" />
              </Button>
            )}
            
            {onDelete && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
