
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MessageSquare, Send, Users, Eye, Clock, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MassMessage, MassMessageForm } from "@/types/massMessage";

const MassMessaging = () => {
  const [messages, setMessages] = useState<MassMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState<MassMessageForm>({
    title: '',
    content: '',
    recipient_type: 'all',
    call_to_action: undefined
  });
  const [showCTA, setShowCTA] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('admin_announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to fetch mass messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error('Please fill in both title and content');
      return;
    }

    try {
      setSending(true);

      // Create the announcement record
      const { data: announcement, error: createError } = await supabase
        .from('admin_announcements')
        .insert({
          title: form.title,
          content: form.content,
          recipient_type: form.recipient_type,
          call_to_action: showCTA && form.call_to_action ? form.call_to_action : null,
          status: 'sending'
        })
        .select()
        .single();

      if (createError) throw createError;

      // Call the edge function to send messages
      const { data, error: sendError } = await supabase.functions.invoke('send-mass-message', {
        body: { announcementId: announcement.id }
      });

      if (sendError) throw sendError;

      toast.success(`Mass message sent to ${data.recipientCount} users`);
      
      // Reset form
      setForm({
        title: '',
        content: '',
        recipient_type: 'all',
        call_to_action: undefined
      });
      setShowCTA(false);
      
      // Refresh messages list
      fetchMessages();
    } catch (error) {
      console.error('Error sending mass message:', error);
      toast.error('Failed to send mass message');
    } finally {
      setSending(false);
    }
  };

  const getRecipientLabel = (type: string) => {
    switch (type) {
      case 'all': return 'All Users';
      case 'craftsmen': return 'Only Craftsmen';
      case 'customers': return 'Only Customers';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'default';
      case 'sending': return 'secondary';
      case 'failed': return 'destructive';
      case 'draft': return 'outline';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Mass Messaging</h2>
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Mass Messaging</h2>
        <p className="mt-2 text-sm text-gray-600">
          Send announcements, updates, and important messages to your user base.
        </p>
      </div>

      {/* Create New Message */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Send New Mass Message
          </CardTitle>
          <CardDescription>
            Create and send messages to specific user groups.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Message Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({...form, title: e.target.value})}
                placeholder="Enter message title..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipient_type">Recipients</Label>
              <Select 
                value={form.recipient_type} 
                onValueChange={(value: 'all' | 'craftsmen' | 'customers') => 
                  setForm({...form, recipient_type: value})
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="craftsmen">Only Craftsmen</SelectItem>
                  <SelectItem value="customers">Only Customers</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Message Content</Label>
            <Textarea
              id="content"
              value={form.content}
              onChange={(e) => setForm({...form, content: e.target.value})}
              placeholder="Enter your message content..."
              rows={4}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCTA(!showCTA)}
            >
              {showCTA ? 'Remove' : 'Add'} Call-to-Action
            </Button>
          </div>

          {showCTA && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="cta_text">Button Text</Label>
                <Input
                  id="cta_text"
                  value={form.call_to_action?.text || ''}
                  onChange={(e) => setForm({
                    ...form, 
                    call_to_action: { 
                      ...form.call_to_action, 
                      text: e.target.value,
                      url: form.call_to_action?.url || ''
                    }
                  })}
                  placeholder="Learn More"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cta_url">Link URL</Label>
                <Input
                  id="cta_url"
                  value={form.call_to_action?.url || ''}
                  onChange={(e) => setForm({
                    ...form, 
                    call_to_action: { 
                      ...form.call_to_action, 
                      text: form.call_to_action?.text || '',
                      url: e.target.value
                    }
                  })}
                  placeholder="https://example.com"
                />
              </div>
            </div>
          )}

          <Button 
            onClick={handleSendMessage} 
            disabled={sending || !form.title.trim() || !form.content.trim()}
            className="w-full md:w-auto"
          >
            <Send className="h-4 w-4 mr-2" />
            {sending ? 'Sending...' : 'Send Message'}
          </Button>
        </CardContent>
      </Card>

      {/* Message History */}
      <Card>
        <CardHeader>
          <CardTitle>Message History</CardTitle>
          <CardDescription>
            View all previously sent mass messages and their performance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Delivered</TableHead>
                <TableHead>Read</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.map((message) => (
                <TableRow key={message.id}>
                  <TableCell className="font-medium">{message.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getRecipientLabel(message.recipient_type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(message.status)}>
                      {message.status === 'sending' && <Clock className="h-3 w-3 mr-1" />}
                      {message.status === 'sent' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {message.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{message.total_recipients}</TableCell>
                  <TableCell>{message.delivered_count}</TableCell>
                  <TableCell>{message.read_count}</TableCell>
                  <TableCell>
                    {new Date(message.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {messages.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No mass messages sent yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MassMessaging;
