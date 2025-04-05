
import React from 'react';
import { Wrench } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CraftsmanSpecializationProps {
  tradeCategory: string;
  customSpecialization?: string | null;
  yearsExperience?: number | null;
}

const CraftsmanSpecialization: React.FC<CraftsmanSpecializationProps> = ({
  tradeCategory,
  customSpecialization,
  yearsExperience
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2 mt-1">
      <Badge variant="outline" className="flex items-center gap-1 bg-gray-50">
        <Wrench className="h-3 w-3" />
        {tradeCategory}
      </Badge>
      
      {customSpecialization && (
        <Badge variant="secondary" className="bg-primary/10 text-primary-foreground">
          {customSpecialization}
        </Badge>
      )}
      
      {yearsExperience && (
        <span className="text-sm text-muted-foreground">
          {yearsExperience} {yearsExperience === 1 ? 'rok' : yearsExperience < 5 ? 'roky' : 'rokov'} skúseností
        </span>
      )}
    </div>
  );
};

export default CraftsmanSpecialization;
