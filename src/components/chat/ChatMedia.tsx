
import React, { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Maximize2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatMediaProps {
  url: string;
  type: 'image' | 'video';
  className?: string;
}

const ChatMedia: React.FC<ChatMediaProps> = ({ url, type, className }) => {
  const [open, setOpen] = useState(false);
  
  if (type === 'image') {
    return (
      <>
        <div className={`relative group cursor-pointer ${className}`}>
          <img 
            src={url} 
            alt="Shared media" 
            className="rounded-lg max-h-[200px] object-cover"
            onClick={() => setOpen(true)}
          />
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => setOpen(true)}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-[80vw] max-h-[90vh] p-0 overflow-hidden">
            <div className="p-2 absolute top-0 right-0 z-10">
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-6 pt-12 max-h-[90vh] overflow-auto">
              <img 
                src={url} 
                alt="Shared media" 
                className="max-w-full max-h-[80vh] object-contain mx-auto"
              />
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }
  
  if (type === 'video') {
    return (
      <>
        <div className={`relative group cursor-pointer ${className}`}>
          <AspectRatio ratio={16/9} className="bg-black rounded-lg">
            <video 
              src={url} 
              controls 
              className="w-full h-full rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </AspectRatio>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => setOpen(true)}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-[80vw] max-h-[90vh] p-0 overflow-hidden">
            <div className="p-2 absolute top-0 right-0 z-10">
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-6 pt-12 max-h-[90vh] overflow-auto">
              <AspectRatio ratio={16/9} className="bg-black rounded-lg max-w-3xl mx-auto">
                <video 
                  src={url} 
                  controls 
                  className="w-full h-full rounded-lg"
                />
              </AspectRatio>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }
  
  return null;
};

export default ChatMedia;
