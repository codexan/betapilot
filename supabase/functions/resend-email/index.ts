/// <reference path="./deno.d.ts" />

// Import types
import type { EmailRequestPayload, Invitation, CampaignData, UserConfig, ResendSuccessResponse, ResendErrorResponse } from "./types.d.ts";

// Get environment variables directly from Deno.env
const resendApiKey = Deno.env.get("RESEND_API_KEY");

// Supabase Edge Functions handler
Deno.serve(async (req: Request) => {
  // ✅ CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "*"
      }
    });
  }

  try {
    const { invitations, campaignData, userConfig } = await req.json() as EmailRequestPayload;
    console.log('Resend API Key:', resendApiKey ? 'Loaded' : 'Missing');

    if (!resendApiKey) {
      throw new Error("Resend API key not configured");
    }

    const emailResults = [];

    for (const invitation of invitations) {
      try {
        const personalizedSubject = campaignData.emailSubject.replace(/{{([^}]+)}}/g, (_: string, key: string) => {
          switch (key.trim()) {
            case "first_name": return invitation.firstName || "there";
            case "campaign_name": return campaignData.campaignName || "Beta Program";
            default: return _;
          }
        });

        const personalizedContent = campaignData.emailContent.replace(/{{([^}]+)}}/g, (_: string, key: string) => {
          switch (key.trim()) {
            case "first_name": return invitation.firstName || "there";
            case "campaign_name": return campaignData.campaignName || "Beta Program";
            default: return _;
          }
        });

        const emailContent = personalizedContent;

        const resendResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            from: `${userConfig?.senderName ?? "PilotBeta"} <${userConfig?.senderEmail ?? "PilotBeta@melvimiranda.com"}>`,
            to: [invitation.email],
            subject: personalizedSubject,
            html: emailContent.replace(/\n/g, "<br>"),
            text: emailContent
          })
        });

        const resendData = await resendResponse.json() as ResendSuccessResponse | ResendErrorResponse;

        emailResults.push({
          email: invitation.email,
          success: resendResponse.ok,
          messageId: resendResponse.ok ? (resendData as ResendSuccessResponse).id : undefined,
          error: resendResponse.ok ? null : (resendData as ResendErrorResponse).message || "Failed to send email",
          status: resendResponse.ok ? "sent" : "failed"
        });
      } catch (emailError) {
        emailResults.push({
          email: invitation.email,
          success: false,
          error: emailError instanceof Error ? emailError.message : String(emailError),
          status: "failed"
        });
      }
    }

    const successCount = emailResults.filter(r => r.success).length;
    const failureCount = emailResults.length - successCount;

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
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      results: []
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
});
