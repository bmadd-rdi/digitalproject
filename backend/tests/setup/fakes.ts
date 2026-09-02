import type {
  Clock,
  EmailResult,
  EmailService,
  PdfCompressor,
} from "../../src/shared/app/services";

export type SentEmail = {
  recipient: string;
  type: "verification" | "usernameRecovery" | "passwordReset";
  token?: string;
  payload: Record<string, unknown>;
  sentAt: Date;
};

export class FakeEmailService implements EmailService {
  readonly sent: SentEmail[] = [];
  readonly attempts: SentEmail[] = [];
  shouldFail = false;
  failure = new Error("Fake email delivery failed");
  now = () => new Date();

  private result(): EmailResult {
    return this.shouldFail ? { success: false, error: this.failure } : { success: true };
  }

  private record(message: SentEmail) {
    this.attempts.push(message);
    if (!this.shouldFail) this.sent.push(message);
  }

  async sendVerificationEmail(email: string, token: string, name: string) {
    this.record({
      recipient: email,
      type: "verification",
      token,
      payload: { name },
      sentAt: this.now(),
    });
    return this.result();
  }

  async sendUsernameRecoveryEmail(email: string, username: string) {
    this.record({
      recipient: email,
      type: "usernameRecovery",
      payload: { username },
      sentAt: this.now(),
    });
    return this.result();
  }

  async sendPasswordResetEmail(email: string, token: string) {
    this.record({
      recipient: email,
      type: "passwordReset",
      token,
      payload: {},
      sentAt: this.now(),
    });
    return this.result();
  }
}

export class FakePdfCompressor implements PdfCompressor {
  shouldFail = false;
  compressedBytes = new TextEncoder().encode("compressed-pdf").buffer;
  calls: Array<{ bytes: number; quality: string }> = [];

  async compressPdf(inputFileBuffer: ArrayBuffer, quality = "/ebook") {
    this.calls.push({ bytes: inputFileBuffer.byteLength, quality });
    if (this.shouldFail) throw new Error("Fake PDF compression failed");
    return this.compressedBytes;
  }
}

export class FakeClock implements Clock {
  constructor(private current = new Date("2026-01-01T00:00:00.000Z")) {}

  now() {
    return new Date(this.current);
  }

  set(value: Date | string) {
    this.current = new Date(value);
  }

  advance(milliseconds: number) {
    this.current = new Date(this.current.getTime() + milliseconds);
  }
}
