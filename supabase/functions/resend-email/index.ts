import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

// Add Deno global declaration at the top
declare const Deno: any;

serve(async (req) => {
  // ✅ CORS preflight
  if (req?.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*", // DO NOT CHANGE THIS
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "*" // DO NOT CHANGE THIS
      }
    });
  }
  
  try {
    // Parse request body
    const { invitations, campaignData, userConfig } = await req?.json();
    
    // Get Resend API key from environment
    const resendApiKey = Deno?.env?.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new Error('Resend API key not configured');
    }

    // Prepare batch email requests
    const emailResults = [];
    
    for (const invitation of invitations) {
      try {
        // Prepare email content with personalization
        const personalizedSubject = campaignData?.emailSubject?.replace(/{{([^}]+)}}/g, (match, key) => {
          switch (key?.trim()) {
            case 'first_name':
              return invitation?.firstName || 'there';
            case 'campaign_name':
              return campaignData?.campaignName || 'Beta Program';
            default:
              return match;
          }
        });

        const personalizedContent = campaignData?.emailContent?.replace(/{{([^}]+)}}/g, (match, key) => {
          switch (key?.trim()) {
            case 'first_name':
              return invitation?.firstName || 'there';
            case 'campaign_name':
              return campaignData?.campaignName || 'Beta Program';
            default:
              return match;
          }
        });

        // Add automatic signature
        const emailContent = personalizedContent + '\n\n— The BetaPilot Team';

        // Send email via Resend API
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: userConfig?.senderEmail || 'PM Name (BetaPilot) <notifications@betapilot.com>',
            to: [invitation?.email],
            subject: personalizedSubject,
            html: emailContent?.replace(/\n/g, '<br>'), // Convert to HTML
            text: emailContent, // Plain text fallback
          }),
        });

        const resendData = await resendResponse?.json();

        if (resendResponse?.ok) {
          emailResults?.push({
            email: invitation?.email,
            success: true,
            messageId: resendData?.id,
            status: 'sent'
          });
        } else {
          emailResults?.push({
            email: invitation?.email,
            success: false,
            error: resendData?.message || 'Failed to send email',
            status: 'failed'
          });
        }
      } catch (emailError) {
        emailResults?.push({
          email: invitation?.email,
          success: false,
          error: emailError?.message,
          status: 'failed'
        });
      }
    }

    // Calculate stats
    const successCount = emailResults?.filter(result => result?.success)?.length;
    const failureCount = emailResults?.filter(result => !result?.success)?.length;

    return new Response(JSON.stringify({
      success: true,
      results: emailResults,
      stats: {
        total: invitations.length,
        sent: successCount,
        failed: failureCount
      },
      message: `Sent ${successCount} of ${invitations.length} invitations via Resend`
    }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" // DO NOT CHANGE THIS
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      results: []
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" // DO NOT CHANGE THIS
      }
    });
  }
});