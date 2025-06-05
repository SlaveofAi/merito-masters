
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendMassMessageRequest {
  announcementId: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { announcementId }: SendMassMessageRequest = await req.json();

    // Get the announcement details
    const { data: announcement, error: announcementError } = await supabase
      .from('admin_announcements')
      .select('*')
      .eq('id', announcementId)
      .single();

    if (announcementError || !announcement) {
      throw new Error('Announcement not found');
    }

    // Get recipients based on the type
    let recipients: any[] = [];
    
    if (announcement.recipient_type === 'all') {
      // Get all users (customers and craftsmen)
      const { data: customers } = await supabase
        .from('customer_profiles')
        .select('id, name');
      
      const { data: craftsmen } = await supabase
        .from('craftsman_profiles')
        .select('id, name');
      
      recipients = [
        ...(customers || []),
        ...(craftsmen || [])
      ];
    } else if (announcement.recipient_type === 'customers') {
      const { data: customers } = await supabase
        .from('customer_profiles')
        .select('id, name');
      recipients = customers || [];
    } else if (announcement.recipient_type === 'craftsmen') {
      const { data: craftsmen } = await supabase
        .from('craftsman_profiles')
        .select('id, name');
      recipients = craftsmen || [];
    }

    console.log(`Sending mass message to ${recipients.length} recipients`);

    // Create conversations and send messages for each recipient
    const adminId = announcement.admin_id;
    let deliveredCount = 0;

    for (const recipient of recipients) {
      try {
        // Check if conversation already exists between admin and user
        let conversationId: string;
        
        const { data: existingConversation } = await supabase
          .from('chat_conversations')
          .select('id')
          .or(`and(customer_id.eq.${adminId},craftsman_id.eq.${recipient.id}),and(customer_id.eq.${recipient.id},craftsman_id.eq.${adminId})`)
          .limit(1)
          .single();

        if (existingConversation) {
          conversationId = existingConversation.id;
        } else {
          // Create new conversation
          const { data: newConversation, error: convError } = await supabase
            .from('chat_conversations')
            .insert({
              customer_id: adminId,
              craftsman_id: recipient.id
            })
            .select('id')
            .single();

          if (convError) {
            console.error('Error creating conversation:', convError);
            continue;
          }
          conversationId = newConversation.id;
        }

        // Prepare message content with call-to-action if present
        let messageContent = announcement.content;
        const messageMetadata: any = {
          type: 'admin_announcement',
          announcement_id: announcement.id,
          title: announcement.title
        };

        if (announcement.call_to_action) {
          messageContent += `\n\n[${announcement.call_to_action.text}](${announcement.call_to_action.url})`;
          messageMetadata.call_to_action = announcement.call_to_action;
        }

        // Send the message
        const { error: messageError } = await supabase
          .from('chat_messages')
          .insert({
            conversation_id: conversationId,
            sender_id: adminId,
            receiver_id: recipient.id,
            content: messageContent,
            metadata: messageMetadata
          });

        if (messageError) {
          console.error('Error sending message:', messageError);
          continue;
        }

        // Create notification
        await supabase
          .from('notifications')
          .insert({
            user_id: recipient.id,
            type: 'admin_announcement',
            title: announcement.title,
            content: announcement.content.substring(0, 200) + (announcement.content.length > 200 ? '...' : ''),
            metadata: {
              announcement_id: announcement.id,
              conversation_id: conversationId
            }
          });

        // Track recipient
        await supabase
          .from('announcement_recipients')
          .insert({
            announcement_id: announcement.id,
            user_id: recipient.id
          });

        deliveredCount++;
      } catch (error) {
        console.error(`Error sending to recipient ${recipient.id}:`, error);
      }
    }

    // Update announcement with delivery stats
    await supabase
      .from('admin_announcements')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        total_recipients: recipients.length,
        delivered_count: deliveredCount
      })
      .eq('id', announcementId);

    console.log(`Mass message sent successfully. Delivered to ${deliveredCount}/${recipients.length} recipients`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        recipientCount: recipients.length,
        deliveredCount: deliveredCount
      }),
      {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error) {
    console.error("Error in send-mass-message function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
