
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SpecializationInputProps {
  value: string;
  onSave: (value: string) => Promise<void>;
  isLoading: boolean;
}

const SpecializationInput: React.FC<SpecializationInputProps> = ({ 
  value, 
  onSave, 
  isLoading 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [specialization, setSpecialization] = useState(value || '');

  // Update local state when the prop changes
  useEffect(() => {
    setSpecialization(value || '');
  }, [value]);

  const handleSave = async () => {
    await onSave(specialization);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setSpecialization(value || '');
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex flex-col space-y-2">
        <Input
          placeholder="Doplňte vašu špecializáciu"
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            onClick={handleSave} 
            disabled={isLoading}
          >
            {isLoading ? "Ukladám..." : "Uložiť"}
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleCancel}
            disabled={isLoading}
          >
            Zrušiť
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <span>
        {value ? value : <span className="text-gray-400">Žiadna vlastná špecializácia</span>}
      </span>
      <Button 
        size="sm" 
        variant="ghost" 
        onClick={() => setIsEditing(true)}
        className="h-7 px-2 text-xs"
      >
        {value ? 'Upraviť' : 'Pridať'}
      </Button>
    </div>
  );
};

export default SpecializationInput;
