
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  text?: string;
  replyTo?: string;
}

export const useEmailService = () => {
  const [isSending, setIsSending] = useState(false);

  const sendEmail = async (params: SendEmailParams) => {
    if (!params.to || !params.subject || !params.html) {
      toast.error("Email data incomplete", { 
        description: "Recipient, subject, and content are required"
      });
      return { success: false, error: "Missing required email parameters" };
    }
    
    setIsSending(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: params
      });
      
      if (error) throw error;
      
      toast.success("Email sent successfully");
      return { success: true, data };
    } catch (error: any) {
      console.error("Error sending email:", error);
      toast.error("Failed to send email", { 
        description: error.message || "An unknown error occurred" 
      });
      return { success: false, error };
    } finally {
      setIsSending(false);
    }
  };

  return { sendEmail, isSending };
};
