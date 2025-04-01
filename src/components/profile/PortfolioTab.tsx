
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Image, UploadCloud, Plus } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import ProjectCard, { Project } from "./ProjectCard";
import ProjectForm from "./ProjectForm";
import { uploadPortfolioImages } from "@/utils/imageUpload";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const PortfolioTab: React.FC = () => {
  const {
    userType,
    isCurrentUser,
    portfolioImages,
    profileData,
    activeImageIndex,
    handleImageClick,
    handlePortfolioImageUpload,
    uploading,
    fetchPortfolioImages
  } = useProfile();

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // In a real implementation, you would fetch projects from the database here
  // For now, we'll just use the portfolioImages as a simple representation
  React.useEffect(() => {
    if (portfolioImages.length > 0 && profileData) {
      // Convert portfolio images to projects format
      // This is a temporary solution until we implement the proper database structure
      const mappedProjects = portfolioImages.reduce((acc: Project[], image, index) => {
        // Create a new project for every 2 images
        if (index % 2 === 0) {
          acc.push({
            id: `project-${index}`,
            title: `Projekt ${index + 1}`,
            description: "Ukážka mojej práce",
            created_at: new Date().toISOString(),
            images: [{
              id: image.id,
              image_url: image.image_url
            }]
          });
        } else if (acc.length > 0) {
          // Add the image to the last project
          acc[acc.length - 1].images.push({
            id: image.id,
            image_url: image.image_url
          });
        }
        return acc;
      }, []);
      
      setProjects(mappedProjects);
    }
  }, [portfolioImages, profileData]);

  const handleProjectSelect = (id: string) => {
    setSelectedProjectId(id);
  };

  const handleAddProject = async (title: string, description: string, images: File[]) => {
    if (!profileData || !profileData.id) {
      toast.error("Nie je možné pridať projekt, chýba ID profilu");
      return;
    }
    
    try {
      // Upload the images
      const uploadedUrls = await uploadPortfolioImages(images, profileData.id);
      
      if (uploadedUrls.length > 0) {
        toast.success("Projekt bol úspešne pridaný");
        // Refresh the portfolio images
        if (fetchPortfolioImages) {
          fetchPortfolioImages(profileData.id);
        }
        setShowProjectForm(false);
      } else {
        toast.error("Nepodarilo sa nahrať obrázky projektu");
      }
    } catch (error) {
      console.error("Error adding project:", error);
      toast.error("Nastala chyba pri pridávaní projektu");
    }
  };

  if (userType !== 'craftsman') {
    return (
      <div className="text-center p-8">
        <h3 className="text-xl font-semibold mb-4">Zákazník</h3>
        <p>Toto je profil zákazníka, ktorý vyhľadáva služby remeselníkov.</p>
      </div>
    );
  }

  if (showProjectForm) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold mb-4">Pridať nový projekt</h3>
        <ProjectForm
          onSubmit={handleAddProject}
          onCancel={() => setShowProjectForm(false)}
        />
      </div>
    );
  }

  const selectedProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
      <div className="md:col-span-8 bg-white rounded-lg overflow-hidden border border-border/50 shadow-sm">
        {selectedProject && selectedProject.images.length > 0 ? (
          <div>
            <div className="aspect-video w-full">
              <Carousel>
                <CarouselContent>
                  {selectedProject.images.map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="w-full aspect-video">
                        <img
                          src={image.image_url}
                          alt={`Project image ${index + 1}`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>
            </div>
            
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">{selectedProject.title}</h3>
              <p className="text-gray-600">{selectedProject.description}</p>
            </div>
          </div>
        ) : (
          <div className="w-full aspect-video flex flex-col items-center justify-center bg-gray-100">
            <Image className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 mb-2">Žiadne ukážky predchádzajúcich projektov</p>
            {isCurrentUser && (
              <Button onClick={() => setShowProjectForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Pridať nový projekt
              </Button>
            )}
          </div>
        )}
      </div>
      
      <div className="md:col-span-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Predchádzajúce projekty</h3>
          {isCurrentUser && (
            <Button variant="outline" size="sm" onClick={() => setShowProjectForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Pridať
            </Button>
          )}
        </div>
        
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onSelect={handleProjectSelect}
                isSelected={project.id === selectedProjectId}
              />
            ))}
          </div>
        ) : (
          isCurrentUser && (
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
              <UploadCloud className="w-12 h-12 text-gray-400 mb-3" />
              <p className="text-center text-gray-500 mb-4">
                Ukážte svoje práce potenciálnym zákazníkom
              </p>
              <Button onClick={() => setShowProjectForm(true)}>
                Pridať prvý projekt
              </Button>
            </div>
          )
        )}
        
        {userType === 'craftsman' && 'trade_category' in profileData && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Špecializácia</h3>
            <div className="flex flex-wrap gap-2">
              <div className="bg-secondary px-3 py-1 rounded-full text-sm">
                {profileData.trade_category}
              </div>
              {'years_experience' in profileData && profileData.years_experience && (
                <div className="bg-secondary px-3 py-1 rounded-full text-sm">
                  {profileData.years_experience} rokov skúseností
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioTab;
