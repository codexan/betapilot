/// <reference types="https://deno.land/x/types/deno.d.ts" />

declare global {
  namespace Deno {
    export function serve(handler: (request: Request) => Response | Promise<Response>): void;
    export namespace env {
      export function get(key: string): string | undefined;
    }
  }
}

export {};
