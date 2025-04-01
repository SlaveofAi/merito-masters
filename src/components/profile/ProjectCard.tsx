
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

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
  isSelected: boolean;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect, isSelected }) => {
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
      <CardHeader className="p-4">
        <CardTitle className="text-base line-clamp-1">{project.title}</CardTitle>
        <CardDescription className="line-clamp-2 text-xs">
          {project.description}
        </CardDescription>
      </CardHeader>
    </Card>
  );
};

export default ProjectCard;
