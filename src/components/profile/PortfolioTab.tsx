import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Image, UploadCloud, Plus, Edit, Trash2, X, MessageSquare } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import ProjectCard, { Project } from "./ProjectCard";
import ProjectForm from "./ProjectForm";
import { uploadPortfolioImages } from "@/utils/imageUpload";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

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
  
  const navigate = useNavigate();

  // Early redirection for customers
  useEffect(() => {
    if (userType === 'customer') {
      console.log("Customer detected in PortfolioTab component, redirecting to reviews");
      navigate("/profile/reviews", { replace: true });
    }
  }, [userType, navigate]);

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [deletingImage, setDeletingImage] = useState<string | null>(null);
  const [processingProject, setProcessingProject] = useState(false);

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
    
    setProcessingProject(true);
    
    try {
      // Check if we're editing an existing project (editingProject is set)
      if (editingProject) {
        // First, update existing image records with the new title and description
        const updatePromises = editingProject.images.map(img => {
          return supabase
            .from('portfolio_images')
            .update({ 
              title: title,
              description: description 
            })
            .eq('id', img.id);
        });
        
        await Promise.all(updatePromises);
        
        // Now handle any new images that need to be uploaded
        if (images.length > 0) {
          const uploadedUrls = await uploadPortfolioImages(images, profileData.id);
          
          if (uploadedUrls.length > 0) {
            const newImageUpdatePromises = uploadedUrls.map(url => {
              return supabase
                .from('portfolio_images')
                .update({ 
                  title: title,
                  description: description 
                })
                .eq('image_url', url);
            });
            
            await Promise.all(newImageUpdatePromises);
          }
        }
        
        toast.success("Projekt bol úspešne aktualizovaný");
      } else {
        // Creating a new project
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
        } else {
          toast.error("Nepodarilo sa nahrať obrázky projektu");
        }
      }
      
      if (fetchPortfolioImages) {
        await fetchPortfolioImages(profileData.id);
      }
      
      setShowProjectForm(false);
      setEditingProject(null);
    } catch (error: any) {
      console.error("Error adding/updating project:", error);
      toast.error(`Nastala chyba pri úprave projektu: ${error.message || 'Neznáma chyba'}`);
    } finally {
      setProcessingProject(false);
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
      
      // First, get the image record to get the storage URL
      const { data: imageData, error: fetchError } = await supabase
        .from('portfolio_images')
        .select('image_url')
        .eq('id', imageId)
        .single();
        
      if (fetchError) {
        throw fetchError;
      }
      
      // Delete the database record
      const { error } = await supabase
        .from('portfolio_images')
        .delete()
        .eq('id', imageId);
        
      if (error) {
        throw error;
      }
      
      // Try to delete the storage file if we have the URL
      if (imageData && imageData.image_url) {
        // Extract the path from the URL
        const urlParts = imageData.image_url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const filePath = `portfolio/${fileName}`;
        
        // Delete from storage (this might fail if the file doesn't exist, which is fine)
        try {
          await supabase.storage
            .from('profile_images')
            .remove([filePath]);
        } catch (storageError) {
          console.warn("Could not delete file from storage:", storageError);
        }
      }
      
      // Update the local state
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
    } catch (error: any) {
      console.error("Error deleting image:", error);
      toast.error(`Nastala chyba pri mazaní obrázka: ${error.message || 'Neznáma chyba'}`);
    } finally {
      setDeletingImage(null);
    }
  };

  if (userType === 'customer') {
    return null; // Don't render anything while redirecting
  }

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
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8">
      {/* Project list sidebar - hidden on mobile until toggled */}
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
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-1 gap-3">
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
      
      {/* Project detail view - full width on mobile */}
      <div className="md:col-span-8 bg-white rounded-lg overflow-hidden border border-border/50 shadow-sm">
        {selectedProject && selectedProject.images.length > 0 ? (
          <div>
            <div className="w-full relative">
              <Carousel className="w-full">
                <CarouselContent>
                  {selectedProject.images.map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="w-full aspect-auto md:aspect-video relative flex items-center justify-center bg-black/5">
                        <img
                          src={image.image_url}
                          alt={`Project image ${index + 1}`}
                          className="max-w-full max-h-[70vh] object-contain"
                        />
                        {isCurrentUser && (
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 opacity-70 hover:opacity-100"
                            onClick={() => handleDeleteImage(image.id)}
                            disabled={deletingImage === image.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2 sm:left-4" />
                <CarouselNext className="right-2 sm:right-4" />
              </Carousel>
            </div>
            
            <div className="p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{selectedProject.title}</h3>
                  <p className="text-gray-600">{selectedProject.description}</p>
                </div>
                {isCurrentUser && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEditProject(selectedProject)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Upraviť
                  </Button>
                )}
              </div>
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
        
        {userType === 'craftsman' && 'trade_category' in profileData && (
          <div className="p-4 sm:p-6 border-t border-border/50">
            <h3 className="text-xl font-semibold mb-4">Fotogaléria prác</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {portfolioImages.map((image) => (
                <div 
                  key={image.id} 
                  className="aspect-square rounded-md overflow-hidden border border-border/50 relative group"
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
