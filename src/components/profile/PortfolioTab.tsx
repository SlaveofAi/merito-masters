
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Image, UploadCloud, Plus, Wrench } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";
import ProjectCard, { Project } from "./ProjectCard";
import ProjectForm from "./ProjectForm";
import ProjectDetail from "./ProjectDetail";
import { uploadPortfolioImages } from "@/utils/imageUpload";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import CraftsmanSpecialization from "./CraftsmanSpecialization";

const PortfolioTab: React.FC = () => {
  const {
    userType,
    isCurrentUser,
    portfolioImages,
    profileData,
    handlePortfolioImageUpload,
    uploading,
    fetchPortfolioImages
  } = useProfile();

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingImage, setDeletingImage] = useState<string | null>(null);

  useEffect(() => {
    if (portfolioImages.length > 0 && profileData) {
      const projectGroups: {[key: string]: any[]} = {};
      
      portfolioImages.forEach((image) => {
        const projectTitle = image.title || `Projekt ${image.id.substring(0, 4)}`;
        if (!projectGroups[projectTitle]) {
          projectGroups[projectTitle] = [];
        }
        projectGroups[projectTitle].push(image);
      });
      
      const mappedProjects = Object.entries(projectGroups).map(([title, images], index) => {
        return {
          id: `project-${index}`,
          title: title,
          description: images[0].description || "Ukážka mojej práce",
          created_at: images[0].created_at,
          projectType: "craftsman" in profileData ? profileData.trade_category : undefined,
          images: images.map(img => ({
            id: img.id,
            image_url: img.image_url
          }))
        };
      });
      
      setProjects(mappedProjects);
      if (!selectedProjectId && mappedProjects.length > 0) {
        setSelectedProjectId(mappedProjects[0].id);
      }
    }
  }, [portfolioImages, profileData, selectedProjectId]);

  const handleProjectSelect = (id: string) => {
    setSelectedProjectId(id);
  };

  const handleAddProject = async (title: string, description: string, images: File[]) => {
    if (!profileData || !profileData.id) {
      toast.error("Nie je možné pridať projekt, chýba ID profilu");
      return;
    }
    
    try {
      const uploadedUrls = await uploadPortfolioImages(images, profileData.id);
      
      if (uploadedUrls.length > 0) {
        const updatePromises = uploadedUrls.map(url => {
          return supabase
            .from('portfolio_images')
            .update({ 
              title: title,
              description: description 
            })
            .eq('image_url', url);
        });
        
        await Promise.all(updatePromises);
        
        toast.success("Projekt bol úspešne pridaný");
        if (fetchPortfolioImages) {
          await fetchPortfolioImages(profileData.id);
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

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowProjectForm(true);
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!profileData || !profileData.id) {
      toast.error("Nie je možné vymazať obrázok, chýba ID profilu");
      return;
    }

    try {
      setDeletingImage(imageId);
      
      const { error } = await supabase
        .from('portfolio_images')
        .delete()
        .eq('id', imageId);
        
      if (error) {
        throw error;
      }
      
      const updatedPortfolioImages = portfolioImages.filter(img => img.id !== imageId);
      
      const updatedProjects = projects.map(project => {
        const updatedImages = project.images.filter(img => img.id !== imageId);
        return {
          ...project,
          images: updatedImages
        };
      }).filter(project => project.images.length > 0);
      
      setProjects(updatedProjects);
      
      if (selectedProject && selectedProject.images.length === 1 && selectedProject.images[0].id === imageId) {
        if (updatedProjects.length > 0) {
          setSelectedProjectId(updatedProjects[0].id);
        } else {
          setSelectedProjectId(null);
        }
      }
      
      if (fetchPortfolioImages) {
        await fetchPortfolioImages(profileData.id);
      }
      
      toast.success("Obrázok bol odstránený");
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Nastala chyba pri mazaní obrázka");
    } finally {
      setDeletingImage(null);
    }
  };

  const navigateToNextProject = () => {
    if (projects.length <= 1) return;
    
    const currentIndex = projects.findIndex(p => p.id === selectedProjectId);
    const nextIndex = (currentIndex + 1) % projects.length;
    setSelectedProjectId(projects[nextIndex].id);
  };
  
  const navigateToPreviousProject = () => {
    if (projects.length <= 1) return;
    
    const currentIndex = projects.findIndex(p => p.id === selectedProjectId);
    const prevIndex = (currentIndex - 1 + projects.length) % projects.length;
    setSelectedProjectId(projects[prevIndex].id);
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
        <h3 className="text-xl font-semibold mb-4">
          {editingProject ? "Upraviť projekt" : "Pridať nový projekt"}
        </h3>
        <ProjectForm
          onSubmit={handleAddProject}
          onCancel={() => {
            setShowProjectForm(false);
            setEditingProject(null);
          }}
          initialData={editingProject}
        />
      </div>
    );
  }

  const selectedProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
      <div className="md:col-span-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Moje projekty</h3>
          {isCurrentUser && (
            <Button variant="outline" size="sm" onClick={() => {
              setEditingProject(null);
              setShowProjectForm(true);
            }}>
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
                onEdit={isCurrentUser ? () => handleEditProject(project) : undefined}
                onDelete={isCurrentUser ? () => {
                  project.images.forEach(img => handleDeleteImage(img.id));
                } : undefined}
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
      </div>
      
      <div className="md:col-span-8">
        {selectedProject && selectedProject.images.length > 0 ? (
          <ProjectDetail
            project={selectedProject}
            onEdit={isCurrentUser ? () => handleEditProject(selectedProject) : undefined}
            onDelete={isCurrentUser ? handleDeleteImage : undefined}
            isCurrentUser={isCurrentUser}
            nextProject={navigateToNextProject}
            previousProject={navigateToPreviousProject}
            deletingImage={deletingImage}
          />
        ) : (
          <div className="w-full aspect-video flex flex-col items-center justify-center bg-gray-100 rounded-lg">
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
        
        {userType === 'craftsman' && 'trade_category' in profileData && profileData.trade_category && (
          <div className="mt-8 p-6 bg-white rounded-lg border border-border/50 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Fotogaléria prác</h3>
              {'trade_category' in profileData && (
                <div className="flex items-center">
                  <Wrench className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm font-medium">{profileData.trade_category}</span>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {portfolioImages.map((image) => (
                <div 
                  key={image.id} 
                  className="aspect-square rounded-md overflow-hidden border border-border/50 relative group shadow-sm hover:shadow-md transition-all"
                >
                  <img 
                    src={image.image_url} 
                    alt={image.title || "Obrázok práce"} 
                    className="w-full h-full object-cover" 
                  />
                  {isCurrentUser && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        variant="destructive"
                        size="icon"
                        className="opacity-90 hover:opacity-100"
                        onClick={() => handleDeleteImage(image.id)}
                        disabled={deletingImage === image.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              
              {isCurrentUser && (
                <label 
                  htmlFor="portfolio-upload"
                  className="aspect-square rounded-md overflow-hidden border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Pridať fotku</span>
                  <input
                    id="portfolio-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handlePortfolioImageUpload}
                    disabled={uploading}
                  />
                </label>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioTab;
