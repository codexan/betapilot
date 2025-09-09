import OpenAI from "openai";

interface EmailGenerationRequest {
  campaignName: string;
  availableSlots: Array<{
    date: string;
    startTime: string;
    endTime: string;
  }>;
  companyName: string;
  recipientCount: number;
  customInstructions?: string;
  betaProgramId?: string;
  baseUrl?: string;
}

// Deno.serve(async (req) => {
//   if (req.method === "OPTIONS") {
//     return new Response(null, {
//       status: 204,
//       headers: {
//         "Access-Control-Allow-Origin": "*", // or your frontend domain
//         "Access-Control-Allow-Methods": "POST, OPTIONS",
//         "Access-Control-Allow-Headers": "Content-Type, Authorization"
//       }
//     });
//   }

//   // console.log('Request headers:', req.headers);
//   // console.log('Request method:', req.method);
//   // console.log('Request body:', await req.text());
  
//   try {
//     const { campaignName, availableSlots, companyName, recipientCount, customInstructions } = await req.json() as EmailGenerationRequest;

//     const openai = new OpenAI({
//       apiKey: Deno.env.get("OPENAI_API_KEY"),
//     });

//     // Format slots for AI
//     const slotsByDate = availableSlots?.reduce((acc: any, slot: any) => {
//       if (!acc[slot.date]) acc[slot.date] = [];
//       acc[slot.date].push(`${slot.startTime} - ${slot.endTime}`);
//       return acc;
//     }, {});

//     const slotsSummary = Object.entries(slotsByDate || {})
//       .map(([date, times]) => {
//         const formattedDate = new Date(date).toLocaleDateString("en-US", {
//           weekday: "long",
//           month: "long",
//           day: "numeric",
//         });
//         return `${formattedDate}: ${(times as string[]).join(", ")}`;
//       })
//       .join("\n");

//     const prompt = `Generate a professional scheduling email for a beta testing campaign with these details:

// CAMPAIGN DETAILS:
// - Campaign Name: ${campaignName}
// - Company: ${companyName}
// - Recipients: ${recipientCount} beta testers who have already been invited
// - Available Time Slots:
// ${slotsSummary}

// EMAIL REQUIREMENTS:
// 1. Subject line should be engaging and mention scheduling/booking
// 2. Thank recipients for accepting the beta invitation
// 3. Explain that they can now book their testing session
// 4. List the available time slots clearly
// 5. Include a clear call-to-action to book their slot
// 6. Mention that slots are first-come, first-served
// 7. Include contact information for questions
// 8. Keep tone professional but friendly
// 9. Use HTML formatting for better readability

// ${customInstructions ? `ADDITIONAL INSTRUCTIONS: ${customInstructions}` : ''}

// Generate the email with proper HTML structure, including headers, paragraphs, and a clear layout for the time slots.`;

//     const response = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages: [
//         {
//           role: "system",
//           content:
//             "You are an expert email copywriter specializing in beta testing and user research communications.",
//         },
//         { role: "user", content: prompt },
//       ],
//       response_format: {
//         type: "json_schema",
//         json_schema: {
//           name: "scheduling_email_response",
//           schema: {
//             type: "object",
//             properties: {
//               subject: { type: "string" },
//               content: { type: "string" },
//               preview_text: { type: "string" },
//               call_to_action: { type: "string" },
//             },
//             required: ["subject", "content", "preview_text", "call_to_action"],
//           },
//         },
//       },
//     });

//     return new Response(
//       JSON.stringify(JSON.parse(response.choices[0].message.content || "{}")),
//       {
//         headers: {
//           "Content-Type": "application/json",
//           "Access-Control-Allow-Origin": "*", // or your frontend domain
//           "Access-Control-Allow-Methods": "POST, OPTIONS",
//           "Access-Control-Allow-Headers": "Content-Type, Authorization"
//         }
//       }
//     );
    
//   } catch (err) {
//     console.error(err);
//     return new Response(JSON.stringify({ error: "Failed to generate email" }), {
//       status: 500,
//       headers: {
//         "Content-Type": "application/json",
//         "Access-Control-Allow-Origin": "*",
//         "Access-Control-Allow-Methods": "POST, OPTIONS",
//         "Access-Control-Allow-Headers": "Content-Type, Authorization"
//       }
//     });
    
//   }
// });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
  }

  if (req.method === "POST") {
    try {
      const { campaignName, availableSlots, companyName, recipientCount, customInstructions, betaProgramId, baseUrl } = await req.json() as EmailGenerationRequest;
      
      // Get user info from JWT token
      const authHeader = req.headers.get('Authorization');
      let userInfo = { firstName: 'User', lastName: '', fullName: 'User' };
      
      if (authHeader) {
        try {
          const token = authHeader.replace('Bearer ', '');
          const payload = JSON.parse(atob(token.split('.')[1]));
          
          // Extract user metadata from JWT
          const userMetadata = payload.user_metadata || {};
          const firstName = userMetadata.first_name || userMetadata.firstName || 'User';
          const lastName = userMetadata.last_name || userMetadata.lastName || '';
          const fullName = `${firstName} ${lastName}`.trim();
          
          userInfo = { firstName, lastName, fullName };
        } catch (jwtError) {
          console.log('Could not parse JWT token, using default user info');
        }
      }
      
      // Create booking link
      const bookingLink = betaProgramId && baseUrl 
        ? `${baseUrl}/beta-slot-booking?campaign=${betaProgramId}`
        : 'https://pilotbeta.com/beta-slot-booking';

      // Create name tokens for email personalization
      const nameTokens = {
        '{{FirstName}}': userInfo.firstName,
        '{{CustomerName}}': userInfo.fullName,
        '{{Name}}': userInfo.fullName,
        '{{BookingLink}}': bookingLink
      };

      const openai = new OpenAI({
        apiKey: Deno.env.get("OPENAI_API_KEY"),
      });

      // Format slots for AI
      const slotsByDate = availableSlots?.reduce((acc: any, slot: any) => {
        if (!acc[slot.date]) acc[slot.date] = [];
        acc[slot.date].push(`${slot.startTime} - ${slot.endTime}`);
        return acc;
      }, {});

      const slotsSummary = Object.entries(slotsByDate || {})
        .map(([date, times]) => {
          const formattedDate = new Date(date).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          });
          return `${formattedDate}: ${(times as string[]).join(", ")}`;
        })
        .join("\n");

      const prompt = `Generate a professional scheduling email for a beta testing campaign with these details:

CAMPAIGN DETAILS:
- Campaign Name: ${campaignName}
- Company: ${companyName}
- Recipients: ${recipientCount} beta testers who have already been invited
- Available Time Slots:
${slotsSummary}

PERSONALIZATION TOKENS:
Use these EXACT tokens in the email content for personalization (they will be replaced with actual values):
- {{FirstName}} - Recipient's first name (use in greetings)
- {{CustomerName}} - Recipient's full name
- {{Name}} - Recipient's full name (alternative)
- {{BookingLink}} - Direct link to book a slot (MUST use this exact token, not a placeholder URL)

EMAIL REQUIREMENTS:
1. Subject line should be engaging and mention scheduling/booking
2. Start with a personalized greeting using {{FirstName}}
3. Thank recipients for accepting the beta invitation
4. Explain that they can now book their testing session
5. List the available time slots clearly
6. Include a prominent call-to-action button/link using the EXACT token {{BookingLink}} (do not use placeholder URLs like example.com)
7. Mention that slots are first-come, first-served
8. Include contact information for questions
9. Keep tone professional but friendly
10. Use HTML formatting for better readability
11. Include personalization tokens where appropriate (greeting, sign-off, etc.)
12. Include email sign off as from the 'Pilot Beta Team'. Keep the salution correct
13. Make the {{BookingLink}} the primary action - use it in a prominent button or call-to-action
14. IMPORTANT: All links must include target="_blank" and rel="noopener noreferrer" attributes to open in new tabs

${customInstructions ? `ADDITIONAL INSTRUCTIONS: ${customInstructions}` : ''}

Generate the email with proper HTML structure, including headers, paragraphs, and a clear layout for the time slots. Make sure to use the personalization tokens naturally in the content.

CRITICAL: When creating links, you MUST use the exact token {{BookingLink}} in the href attribute. Do NOT generate placeholder URLs like http://example.com/book-slot or https://calendly.com/... 

Example of correct link usage:
<a href="{{BookingLink}}" target="_blank" rel="noopener noreferrer">Book Your Session</a>

NOT:
<a href="http://example.com/book-slot" target="_blank">Book Your Session</a>`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are an expert email copywriter specializing in beta testing and user research communications.",
          },
          { role: "user", content: prompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "scheduling_email_response",
            schema: {
              type: "object",
              properties: {
                subject: { type: "string" },
                content: { type: "string" },
                preview_text: { type: "string" },
                call_to_action: { type: "string" },
              },
              required: ["subject", "content", "preview_text", "call_to_action"],
            },
          },
        },
      });

      const emailContent = JSON.parse(response.choices[0].message.content || "{}");
      
      // Replace all personalization tokens with actual values in the generated content
      const replaceTokens = (text: string) => {
        if (!text) return text;
        return text
          .replace(/\{\{BookingLink\}\}/g, bookingLink)
          .replace(/\{\{FirstName\}\}/g, nameTokens['{{FirstName}}'])
          .replace(/\{\{CustomerName\}\}/g, nameTokens['{{CustomerName}}'])
          .replace(/\{\{Name\}\}/g, nameTokens['{{Name}}']);
      };
      
      if (emailContent.content) {
        emailContent.content = replaceTokens(emailContent.content);
      }
      if (emailContent.subject) {
        emailContent.subject = replaceTokens(emailContent.subject);
      }
      if (emailContent.preview_text) {
        emailContent.preview_text = replaceTokens(emailContent.preview_text);
      }
      if (emailContent.call_to_action) {
        emailContent.call_to_action = replaceTokens(emailContent.call_to_action);
      }

      return new Response(
        JSON.stringify(emailContent),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization"
          }
        }
      );
    } catch (err) {
      console.error(err);
      return new Response(JSON.stringify({ error: "Failed to generate email" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }
  }

  // Fallback for unsupported methods
  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
});
