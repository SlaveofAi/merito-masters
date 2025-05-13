
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useEmailService } from "@/hooks/useEmailService";
import { useAuth } from "@/hooks/useAuth";

export function EmailForm() {
  const { user } = useAuth();
  const { sendEmail, isSending } = useEmailService();
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recipient || !subject || !content) {
      return;
    }
    
    await sendEmail({
      to: recipient,
      subject,
      html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4338ca;">${subject}</h1>
        <div style="margin: 24px 0; line-height: 1.6;">
          ${content.replace(/\n/g, '<br />')}
        </div>
        <p style="color: #6b7280; font-size: 14px; margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
          This email was sent from the Merito application.
        </p>
      </div>`,
      text: content
    });
  };

  if (!user) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Email Service</CardTitle>
          <CardDescription>You need to be logged in to send emails.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Send an Email</CardTitle>
        <CardDescription>Use this form to send custom emails</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient</Label>
            <Input 
              id="recipient" 
              type="email" 
              placeholder="email@example.com" 
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input 
              id="subject" 
              placeholder="Email subject" 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea 
              id="content" 
              placeholder="Type your message here..." 
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSending}>
            {isSending ? "Sending..." : "Send Email"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
