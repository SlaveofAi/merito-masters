
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, ExternalLink } from "lucide-react";
import { Message } from "@/types/chat";

interface AdminAnnouncementMessageProps {
  message: Message;
  onCTAClick?: (url: string) => void;
}

const AdminAnnouncementMessage = ({ message, onCTAClick }: AdminAnnouncementMessageProps) => {
  const metadata = message.metadata;
  const isAnnouncement = metadata?.type === 'admin_announcement';
  
  if (!isAnnouncement) return null;

  const handleCTAClick = () => {
    if (metadata?.call_to_action?.url) {
      if (onCTAClick) {
        onCTAClick(metadata.call_to_action.url);
      } else {
        window.open(metadata.call_to_action.url, '_blank');
      }
    }
  };

  return (
    <Card className="border-l-4 border-l-blue-500 bg-blue-50/50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-white" />
            </div>
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-blue-600 border-blue-200">
                Admin Announcement
              </Badge>
              <span className="text-xs text-gray-500">
                {new Date(message.created_at).toLocaleString()}
              </span>
            </div>
            
            {metadata?.title && (
              <h4 className="font-semibold text-gray-900">
                {metadata.title}
              </h4>
            )}
            
            <div className="text-gray-700 whitespace-pre-wrap">
              {message.content.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')}
            </div>
            
            {metadata?.call_to_action && (
              <div className="pt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleCTAClick}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  {metadata.call_to_action.text}
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminAnnouncementMessage;
