import type { Context } from "hono";

export type EmailResult = {
  success: boolean;
  error?: unknown;
};

export interface EmailService {
  sendVerificationEmail(email: string, token: string, name: string): Promise<EmailResult>;
  sendUsernameRecoveryEmail(email: string, username: string): Promise<EmailResult>;
  sendPasswordResetEmail(email: string, token: string): Promise<EmailResult>;
}

export interface PdfCompressor {
  compressPdf(
    inputFileBuffer: ArrayBuffer,
    quality?: "/screen" | "/ebook" | "/printer",
  ): Promise<ArrayBuffer>;
}

export interface Clock {
  now(): Date;
}

export interface AppServices {
  emailService: EmailService;
  pdfCompressor: PdfCompressor;
  clock: Clock;
}

export const systemClock: Clock = {
  now: () => new Date(),
};

export function getAppServices(c: Context): AppServices {
  const services = c.get("appServices") as AppServices | undefined;
  if (!services) {
    throw new Error("Application services are not configured");
  }
  return services;
}
