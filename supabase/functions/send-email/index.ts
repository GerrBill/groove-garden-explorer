
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@1.0.0";

// Initialize Resend with API key
const resendApiKey = Deno.env.get("RESEND_API_KEY");
if (!resendApiKey) {
  console.error("RESEND_API_KEY is not set. Please set this environment variable.");
}
const resend = new Resend(resendApiKey);

// Set CORS headers for browser clients
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

interface EmailRequest {
  from?: string;
  to: string;
  subject: string;
  html: string;
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Unauthorized: No auth header');
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );
    
    // Verify token with Supabase
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error('Unauthorized: Invalid token');
    }

    // Parse and validate request body
    const requestData = await req.json();
    const { from, to, subject, html }: EmailRequest = requestData;
    
    if (!to || !subject) {
      throw new Error("Missing required fields: to, subject");
    }

    // Send email
    const emailResponse = await resend.emails.send({
      from: from && from.includes("@") ? from : `GerrbillMedia <noreply@gerrbillmedia.com>`,
      to: [to],
      subject,
      html: html || "<p>This email has no content.</p>",
    });

    return new Response(
      JSON.stringify({ success: true, data: emailResponse }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || "Failed to send email",
        details: error.toString()
      }),
      {
        status: error.message?.includes("Unauthorized") ? 401 : 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
