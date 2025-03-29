
import React from "react";
import { Button } from "@/components/ui/button";
import { Image, UploadCloud } from "lucide-react";

interface PortfolioTabProps {
  userType: string | null;
  isCurrentUser: boolean;
  portfolioImages: any[];
  profileData: any;
  activeImageIndex: number;
  handleImageClick: (index: number) => void;
  handlePortfolioImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
}

const PortfolioTab: React.FC<PortfolioTabProps> = ({
  userType,
  isCurrentUser,
  portfolioImages,
  profileData,
  activeImageIndex,
  handleImageClick,
  handlePortfolioImageUpload,
  uploading,
}) => {
  if (userType !== 'craftsman') {
    return (
      <div className="text-center p-8">
        <h3 className="text-xl font-semibold mb-4">Zákazník</h3>
        <p>Toto je profil zákazníka, ktorý vyhľadáva služby remeselníkov.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      <div className="bg-white rounded-lg overflow-hidden border border-border/50 shadow-sm">
        {portfolioImages.length > 0 ? (
          <img
            src={portfolioImages[activeImageIndex]?.image_url || 'https://images.unsplash.com/photo-1565372781813-6e4d12fd2b12?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'}
            alt="Featured work"
            className="w-full h-96 object-cover object-center transform transition-transform duration-500 hover:scale-105"
          />
        ) : (
          <div className="w-full h-96 flex flex-col items-center justify-center bg-gray-100">
            <Image className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500">Žiadne obrázky v portfóliu</p>
            {isCurrentUser && (
              <label htmlFor="portfolio-images-upload" className="mt-4 cursor-pointer">
                <Button>
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Pridať obrázky
                </Button>
                <input
                  id="portfolio-images-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handlePortfolioImageUpload}
                  disabled={uploading}
                />
              </label>
            )}
          </div>
        )}
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Ukážky prác</h3>
          {isCurrentUser && portfolioImages.length > 0 && (
            <label htmlFor="portfolio-images-upload" className="cursor-pointer">
              <Button variant="outline" size="sm">
                <UploadCloud className="mr-2 h-4 w-4" />
                Pridať ďalšie
              </Button>
              <input
                id="portfolio-images-upload"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handlePortfolioImageUpload}
                disabled={uploading}
              />
            </label>
          )}
        </div>
        
        {portfolioImages.length > 0 ? (
          <div className="grid grid-cols-3 gap-3">
            {portfolioImages.map((image, index) => (
              <div
                key={index}
                className={`relative cursor-pointer rounded-md overflow-hidden border-2 transition-all ${
                  index === activeImageIndex
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-transparent"
                }`}
                onClick={() => handleImageClick(index)}
              >
                <img
                  src={image.image_url}
                  alt={`Work sample ${index + 1}`}
                  className="w-full h-24 object-cover"
                />
              </div>
            ))}
          </div>
        ) : (
          isCurrentUser && (
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
              <UploadCloud className="w-12 h-12 text-gray-400 mb-3" />
              <p className="text-center text-gray-500 mb-4">
                Ukážte svoje práce potenciálnym zákazníkom
              </p>
              <label htmlFor="portfolio-images-upload-2" className="cursor-pointer">
                <Button>Nahrať obrázky do portfólia</Button>
                <input
                  id="portfolio-images-upload-2"
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handlePortfolioImageUpload}
                  disabled={uploading}
                />
              </label>
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
