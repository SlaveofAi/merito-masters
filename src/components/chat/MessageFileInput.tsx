
import React, { useRef, useState } from 'react';
import { PaperclipIcon, Image, FileVideo, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';

interface MessageFileInputProps {
  onFileSelected: (file: File | undefined) => void;
}

const MessageFileInput: React.FC<MessageFileInputProps> = ({ onFileSelected }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    
    if (file.size > MAX_SIZE) {
      toast.error("Súbor je príliš veľký (maximum 10MB)");
      return;
    }
    
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const isSupported = ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'webm'].includes(fileExt || '');
    
    if (!isSupported) {
      toast.error("Nepodporovaný formát súboru. Podporované formáty: JPG, PNG, GIF, MP4, MOV, WEBM");
      return;
    }
    
    setSelectedFile(file);
    onFileSelected(file);
  };
  
  const handleClearFile = () => {
    setSelectedFile(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileSelected(undefined);
  };
  
  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/gif,video/mp4,video/quicktime,video/webm"
        className="hidden"
      />
      
      {selectedFile ? (
        <Badge variant="secondary" className="flex items-center gap-1">
          {selectedFile.type.includes('image') ? (
            <Image className="h-3 w-3" />
          ) : (
            <FileVideo className="h-3 w-3" />
          )}
          <span className="max-w-[120px] truncate">{selectedFile.name}</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-4 w-4 p-0 ml-1" 
            onClick={handleClearFile}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ) : (
        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          onClick={() => fileInputRef.current?.click()}
          title="Priložiť súbor"
        >
          <PaperclipIcon className="h-5 w-5 text-gray-500" />
        </Button>
      )}
    </div>
  );
};

export default MessageFileInput;
