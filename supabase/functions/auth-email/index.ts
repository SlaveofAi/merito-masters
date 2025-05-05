
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { renderAuthEmail } from "./email-templates.ts";

interface WebhookPayload {
  type: "signup" | "magiclink" | "recovery" | "invite";
  email: string;
  new_email?: string;
  data: {
    [key: string]: any;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Not authorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract the payload
    const payload: WebhookPayload = await req.json();
    console.log("Received webhook payload:", payload);

    // Different email templates based on type
    const { type, email } = payload;
    
    // Generate email content
    const emailContent = await renderAuthEmail(type, email, payload.data);
    
    // Log the generated content for debugging
    console.log("Email content generated successfully");
    
    return new Response(
      JSON.stringify({ success: true, emailContent }),
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
