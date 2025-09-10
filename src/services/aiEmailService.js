import openai from '../lib/openai.js';

class AIEmailService {
  /**
   * Generates AI-powered scheduling email content
   * @param {Object} params - Email generation parameters
   * @returns {Promise<Object>} Generated email content
   */
  // async generateSchedulingEmail(params) {
  //   console.log('Generating AI email with params:', params);
  //   const {
  //     campaignName,
  //     availableSlots,
  //     companyName = 'BetaPilot',
  //     recipientCount,
  //     customInstructions = ''
  //   } = params;

  //   console.log('Calling AI email service with:', {
  //     campaignName,
  //     availableSlots,
  //     recipientCount,
  //     customInstructions
  //   });
    

  //   // Format slots for better AI understanding
  //   const slotsSummary = this.formatSlotsForAI(availableSlots);
    
  //   try {
  //     const prompt = this.buildSchedulingPrompt({
  //       campaignName,
  //       slotsSummary,
  //       companyName,
  //       recipientCount,
  //       customInstructions
  //     });

  //     // const response = await openai?.chat?.completions?.create({
  //     //   model: 'gpt-5-mini',
  //     //   messages: [
  //     //     { 
  //     //       role: 'system', 
  //     //       content: 'You are an expert email copywriter specializing in beta testing and user research communications. Create professional, engaging emails that encourage participation while being clear and concise.'
  //     //     },
  //     //     { role: 'user', content: prompt }
  //     //   ],
  //     //   response_format: {
  //     //     type: 'json_schema',
  //     //     json_schema: {
  //     //       name: 'scheduling_email_response',
  //     //       schema: {
  //     //         type: 'object',
  //     //         properties: {
  //     //           subject: { 
  //     //             type: 'string',
  //     //             description: 'Email subject line that encourages opening'
  //     //           },
  //     //           content: { 
  //     //             type: 'string',
  //     //             description: 'Complete HTML email body with scheduling information'
  //     //           },
  //     //           preview_text: {
  //     //             type: 'string',
  //     //             description: 'Preview text for email clients'
  //     //           },
  //     //           call_to_action: {
  //     //             type: 'string',
  //     //             description: 'Primary call-to-action text'
  //     //           }
  //     //         },
  //     //         required: ['subject', 'content', 'preview_text', 'call_to_action'],
  //     //         additionalProperties: false
  //     //       }
  //     //     }
  //     //   },
  //     //   reasoning_effort: 'medium',
  //     //   verbosity: 'medium'
  //     // });

  //     // return JSON.parse(response?.choices?.[0]?.message?.content);

  //     const response = await fetch(
  //       `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-email`,
  //       {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({
  //           campaignName,
  //           availableSlots,
  //           companyName,
  //           recipientCount,
  //           customInstructions
  //         }),
  //       }
  //     );
      
  //     return await response.json();
  //   } catch (error) {
  //     console.error('Error generating AI email content:', error);
  //     throw new Error('Failed to generate email content. Please try again.');
  //   }
  // }
  
  async generateSchedulingEmail(params) {
    console.log('Generating AI email with params:', params);
  
    const {
      campaignName,
      availableSlots,
      companyName = 'PilotBeta',
      recipientCount,
      customInstructions = '',
      betaProgramId,
      baseUrl,
      accessToken, // ✅ passed from SchedulingEmailService
      invitations // ✅ invitations with tokens
    } = params;
  
    console.log('Calling AI email service with:', {
      campaignName,
      availableSlots,
      recipientCount,
      customInstructions,
      invitations: invitations?.length
    });
  
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}` // ✅ secure call
          },
          body: JSON.stringify({
            campaignName,
            availableSlots,
            companyName,
            recipientCount,
            customInstructions,
            betaProgramId,
            baseUrl,
            invitations // ✅ pass invitations to Edge Function
          }),
        }
      );
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI email generation failed:', response.status, errorText);
        throw new Error(`AI email generation failed: ${response.statusText}`);
      }
  
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error generating AI email content:', error);
      throw new Error('Failed to generate email content. Please try again.');
    }
  }
  

  /**
   * Formats available slots for AI processing
   */
  formatSlotsForAI(slots) {
    if (!slots?.length) return 'No slots available';

    const slotsByDate = slots?.reduce((acc, slot) => {
      if (!acc?.[slot?.date]) {
        acc[slot.date] = [];
      }
      acc?.[slot?.date]?.push(`${slot?.startTime} - ${slot?.endTime}`);
      return acc;
    }, {});

    return Object.entries(slotsByDate)?.sort(([a], [b]) => a?.localeCompare(b))?.map(([date, times]) => {
        const formattedDate = new Date(date)?.toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'long', 
          day: 'numeric' 
        });
        return `${formattedDate}: ${times?.join(', ')}`;
      })?.join('\n');
  }

  /**
   * Builds the prompt for scheduling email generation
   */
  buildSchedulingPrompt(params) {
    const { campaignName, slotsSummary, companyName, recipientCount, customInstructions } = params;

    return `Generate a professional scheduling email for a beta testing campaign with these details:

CAMPAIGN DETAILS:
- Campaign Name: ${campaignName}
- Company: ${companyName}
- Recipients: ${recipientCount} beta testers who have already been invited
- Available Time Slots:
${slotsSummary}

EMAIL REQUIREMENTS:
1. Subject line should be engaging and mention scheduling/booking
2. Thank recipients for accepting the beta invitation
3. Explain that they can now book their testing session
4. List the available time slots clearly
5. Include a clear call-to-action to book their slot
6. Mention that slots are first-come, first-served
7. Include contact information for questions
8. Keep tone professional but friendly
9. Use HTML formatting for better readability

${customInstructions ? `ADDITIONAL INSTRUCTIONS: ${customInstructions}` : ''}

Generate the email with proper HTML structure, including headers, paragraphs, and a clear layout for the time slots.`;
  }

  /**
   * Enhances existing email content with AI
   */
  async enhanceEmailContent(existingContent, enhancementType = 'improve') {
    try {
      const prompts = {
        improve: 'Improve this email to make it more engaging and professional while keeping the core message',
        shorten: 'Make this email more concise while preserving all key information',
        personalize: 'Add more personalized touches to make this email feel more human and less corporate',
        urgency: 'Add appropriate urgency to encourage quick action without being pushy'
      };

      const response = await openai?.chat?.completions?.create({
        model: 'gpt-5-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an email optimization expert. Enhance the provided email content based on the specific request while maintaining professionalism and clarity.'
          },
          { 
            role: 'user', 
            content: `${prompts?.[enhancementType] || prompts?.improve}:\n\n${existingContent}`
          }
        ],
        reasoning_effort: 'low',
        verbosity: 'medium'
      });

      return response?.choices?.[0]?.message?.content;
    } catch (error) {
      console.error('Error enhancing email content:', error);
      throw new Error('Failed to enhance email content. Please try again.');
    }
  }

  /**
   * Generates multiple email variations for A/B testing
   */
  async generateEmailVariations(params, count = 3) {
    const variations = [];
    
    const tones = ['professional', 'friendly', 'urgent'];
    const approaches = ['benefit-focused', 'process-focused', 'community-focused'];

    try {
      for (let i = 0; i < Math.min(count, 3); i++) {
        const tone = tones?.[i] || 'professional';
        const approach = approaches?.[i] || 'benefit-focused';
        
        const customParams = {
          ...params,
          customInstructions: `Use a ${tone} tone with a ${approach} approach. Variation ${i + 1} of ${count}.`
        };

        const variation = await this.generateSchedulingEmail(customParams);
        variations?.push({
          ...variation,
          variation_id: i + 1,
          tone,
          approach
        });
      }

      return variations;
    } catch (error) {
      console.error('Error generating email variations:', error);
      throw new Error('Failed to generate email variations. Please try again.');
    }
  }
}

export const aiEmailService = new AIEmailService();