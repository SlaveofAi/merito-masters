
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { renderAuthEmail } from "./email-templates.ts";

interface WebhookPayload {
  user: {
    id: string;
    email: string;
    user_metadata: {
      [key: string]: any;
    };
  };
  email_data: {
    email_action_type: string;
    token: string;
    token_hash: string;
    redirect_to: string;
    site_url: string;
  };
}

serve(async (req) => {
  console.log("Auth email webhook received request");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Log headers for debugging
    console.log("Request headers:", Object.fromEntries(req.headers.entries()));
    
    // Log that we're parsing the request body
    console.log("Parsing request body...");
    
    // Extract the payload
    const payload: WebhookPayload = await req.json();
    console.log("Received webhook payload:", JSON.stringify(payload, null, 2));

    // Get email type and email from the correct webhook structure
    const type = payload.email_data?.email_action_type;
    const email = payload.user?.email;
    
    console.log(`Processing ${type} email template for ${email}`);
    
    if (!type || !email) {
      console.error("Missing required fields - type:", type, "email:", email);
      return new Response(
        JSON.stringify({ error: "Missing required email data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Generate email content with the email_data
    const emailContent = await renderAuthEmail(type, email, payload.email_data);
    
    // Log the generated content for debugging
    console.log("Email content generated successfully");
    console.log("Email template length:", emailContent.length);
    console.log("Email template preview:", emailContent.substring(0, 100) + "...");
    
    // Return the completed email with proper subject
    return new Response(
      JSON.stringify({ 
        html: emailContent,
        subject: getEmailSubject(type),
        success: true 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing auth webhook:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getEmailSubject(type: string): string {
  switch (type) {
    case "signup":
      return "Potvrdenie registrácie v aplikácii Merito";
    case "magiclink":
      return "Prihlásenie do aplikácie Merito";
    case "recovery":
      return "Obnovenie hesla v aplikácii Merito";
    case "invite":
      return "Pozvánka do aplikácie Merito";
    default:
      return "Dôležitá správa z aplikácie Merito";
  }
}
