import React, { useState } from 'react';
import { useProfile } from "@/contexts/ProfileContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import ProjectForm from "./ProjectForm";
import ProjectDetail from "./ProjectDetail";
import { formatDate } from "@/utils/dateUtils";

const PortfolioTab: React.FC = () => {
  const { profileData, projects, isCurrentUser, removeProject } = useProfile();
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);

  // Early return if profile data is not available
  if (!profileData) return null;

  // Fix the trade_category reference by safely accessing it
  const isCraftsman = 'user_type' in profileData && profileData.user_type === 'craftsman';
  const tradeCategory = isCraftsman && 'trade_category' in profileData 
    ? (profileData as any).trade_category 
    : null;

  const handleProjectClick = (project: any) => {
    setSelectedProject(project);
  };

  const handleCloseProjectDetail = () => {
    setSelectedProject(null);
  };

  const handleNextProject = () => {
    if (projects) {
      setCurrentProjectIndex((prevIndex) => (prevIndex + 1) % projects.length);
      setSelectedProject(projects[currentProjectIndex]);
    }
  };

  const handlePrevProject = () => {
    if (projects) {
      setCurrentProjectIndex((prevIndex) => (prevIndex - 1 + projects.length) % projects.length);
      setSelectedProject(projects[currentProjectIndex]);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await removeProject(projectId);
      setSelectedProject(null); // Clear selected project after deletion
    } catch (error: any) {
      console.error("Error deleting project:", error);
    }
  };

  return (
    <div>
      {projects && projects.length > 0 ? (
        <Tabs defaultValue="gallery" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto md:grid-cols-2 mb-4">
            <TabsTrigger value="gallery">Galéria</TabsTrigger>
            <TabsTrigger value="detail">Detail projektu</TabsTrigger>
          </TabsList>

          <TabsContent value="gallery" className="grid gap-4 md:grid-cols-3">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="cursor-pointer hover:opacity-75 transition-opacity"
                onClick={() => handleProjectClick(project)}
              >
                <div className="relative">
                  {project.images && project.images.length > 0 ? (
                    <img
                      src={project.images[0]}
                      alt={project.title}
                      className="w-full h-48 object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 rounded-md flex items-center justify-center text-gray-500">
                      Žiadny obrázok
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 text-white bg-black/50 px-2 py-1 rounded text-sm">
                    {project.title}
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="detail">
            {selectedProject ? (
              <div>
                <ProjectDetail project={selectedProject} />
                <div className="flex justify-between mt-4">
                  <Button variant="outline" size="sm" onClick={handlePrevProject}>
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Predošlý
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteProject(selectedProject.id)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Odstrániť
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleNextProject}>
                    Ďalší
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
                <Button variant="secondary" size="sm" className="mt-4" onClick={handleCloseProjectDetail}>
                  Zavrieť detail
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">Vyberte projekt pre zobrazenie detailov.</div>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <div className="text-center py-6">
          Žiadne projekty v portfóliu.
        </div>
      )}

      {isCurrentUser && (
        <div className="mt-6 text-center">
          <Button onClick={() => setIsAddingProject(true)}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Pridať nový projekt
          </Button>
        </div>
      )}

      <Dialog open={isAddingProject} onOpenChange={setIsAddingProject}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Pridať nový projekt</DialogTitle>
          </DialogHeader>
          <ProjectForm onClose={() => setIsAddingProject(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PortfolioTab;
