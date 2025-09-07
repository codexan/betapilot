// Type declarations for Deno Edge Functions
declare module "https://deno.land/std@0.168.0/http/server.ts" {
  export function serve(handler: (request: Request) => Response | Promise<Response>): void;
}

declare module "https://deno.land/std@0.168.0/dotenv/mod.ts" {
  export interface DotenvConfigOutput {
    [key: string]: string | undefined;
  }
  export function config(): Promise<DotenvConfigOutput>;
}

declare namespace Deno {
  namespace env {
    function get(key: string): string | undefined;
  }
}

// Request payload types
export interface Invitation {
  email: string;
  firstName?: string;
}

export interface CampaignData {
  campaignName: string;
  emailSubject: string;
  emailContent: string;
}

export interface UserConfig {
  senderName?: string;
  senderEmail?: string;
}

export interface EmailRequestPayload {
  invitations: Invitation[];
  campaignData: CampaignData;
  userConfig?: UserConfig;
}

// Resend API response types
export interface ResendSuccessResponse {
  id: string;
}

export interface ResendErrorResponse {
  message: string;
  name?: string;
}
