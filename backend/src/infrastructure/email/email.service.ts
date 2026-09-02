// src/infrastructure/email/email.service.ts
import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import type { EmailService } from "../../shared/app/services";

type SendEmailPayload = {
  to: string;
  subject: string;
  text?: string;
  html: string;
  actionLink?: string;
};

const getFrontendUrl = (): string => {
  return process.env.FRONTEND_URL || 'http://localhost:3000';
};

const logEmailToConsole = (payload: SendEmailPayload) => {
  console.log("\n==================================================================");
  console.log("📧 [EMAIL SERVICE - LOCAL/DEV CONSOLE FALLBACK MODE]");
  console.log(`To:          ${payload.to}`);
  console.log(`Subject:     ${payload.subject}`);
  if (payload.actionLink) {
    console.log(`🔗 Action Link: ${payload.actionLink}`);
  }
  console.log("==================================================================\n");
};

const dispatchEmail = async (payload: SendEmailPayload): Promise<{ success: boolean; error?: unknown }> => {
  const fromName = process.env.SMTP_FROM_NAME || "BMA Digital Project";
  const fromEmail = process.env.SMTP_FROM_EMAIL || "noreply@bma.go.th";
  const fromHeader = `"${fromName}" <${fromEmail}>`;

  // 1. Attempt delivery via Resend API if RESEND_API_KEY is configured
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const res = await resend.emails.send({
        from: fromHeader,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      });

      if (res.error) {
        console.error("Resend API delivery failed:", res.error);
        if (process.env.NODE_ENV !== "production") {
          logEmailToConsole(payload);
          return { success: true };
        }
        return { success: false, error: res.error };
      }
      return { success: true };
    } catch (err) {
      console.error("Resend API exception:", err);
      if (process.env.NODE_ENV !== "production") {
        logEmailToConsole(payload);
        return { success: true };
      }
      return { success: false, error: err };
    }
  }

  // 2. Attempt delivery via SMTP if SMTP_HOST is configured
  if (process.env.SMTP_HOST) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true",
        requireTLS: true,
        auth: process.env.SMTP_USER ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        } : undefined,
        tls: {
          rejectUnauthorized: false
        }
      });

      await transporter.sendMail({
        from: fromHeader,
        to: payload.to,
        subject: payload.subject,
        text: payload.text,
        html: payload.html,
      });
      return { success: true };
    } catch (err) {
      console.error("SMTP delivery failed:", err);
      if (process.env.NODE_ENV !== "production") {
        logEmailToConsole(payload);
        return { success: true };
      }
      return { success: false, error: err };
    }
  }

  // 3. Fallback: Log email and action link clearly to terminal in dev mode
  logEmailToConsole(payload);
  return { success: true };
};

export const sendVerificationEmail = async (email: string, token: string, name: string) => {
  const verifyLink = `${getFrontendUrl()}/verify?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Email</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Sarabun:wght@400;500;700&display=swap" rel="stylesheet">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f9f9ff; font-family: 'Inter', 'Sarabun', sans-serif; -webkit-font-smoothing: antialiased;">

      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f9f9ff; padding: 48px 16px;">
        <tr>
          <td align="center">

            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #ffffff; border: 1px solid #D1CDC7; border-radius: 8px; box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.04); overflow: hidden;">

              <tr>
                <td style="padding: 48px 40px; text-align: left;">

                  <p style="margin: 0 0 16px 0; font-size: 14px; font-weight: 700; line-height: 16px; letter-spacing: 0.04em; text-transform: uppercase; color: #00734B;">
                    Account Verification
                  </p>

                  <h1 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 500; line-height: 32px; color: #191c20; letter-spacing: -0.01em;">
                    สวัสดีคุณ ${name}
                  </h1>

                  <p style="margin: 0 0 16px 0; font-size: 16px; font-weight: 400; line-height: 24px; color: #191c20;">
                    ขอบคุณที่ลงทะเบียนเข้าใช้งานระบบ <strong>BMA Digital Project</strong> แพลตฟอร์มบริหารจัดการโครงการเทคโนโลยีสารสนเทศ กรุงเทพมหานคร
                  </p>

                  <p style="margin: 0 0 40px 0; font-size: 16px; font-weight: 400; line-height: 24px; color: #3f4942;">
                    กรุณาคลิกปุ่มด้านล่างนี้เพื่อยืนยันความถูกต้องของอีเมล และเปิดใช้งานบัญชีของคุณภายใน 24 ชั่วโมง
                  </p>

                  <table border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 16px auto;">
                    <tr>
                      <td align="center" style="border-radius: 4px; background-color: #00734B;">
                        <a href="${verifyLink}" target="_blank" style="display: inline-block; padding: 16px 36px; font-size: 16px; font-weight: 500; line-height: 16px; color: #ffffff; text-decoration: none; border-radius: 4px; background-color: #00734B; border: 1px solid #00734B;">
                          ยืนยันที่อยู่อีเมล
                        </a>
                        <br><br>

                        <!-- เพิ่มส่วนนี้เข้าไปด้านล่างปุ่ม -->
                        <p style="font-size: 14px; color: #666;">
                          หากปุ่มด้านบนไม่สามารถคลิกได้ กรุณาคัดลอกลิงก์ด้านล่างนี้ไปวางในเบราว์เซอร์ของคุณ:<br>
                          <span style="color: #007bff; word-break: break-all;">${verifyLink}</span>
                        </p>
                      </td>
                    </tr>
                  </table>

                </td>
              </tr>

              <tr>
                <td style="padding: 24px 40px; background-color: #f3f3fa; border-top: 1px solid #D1CDC7; text-align: center;">
                  <p style="margin: 0; font-size: 13px; font-weight: 400; line-height: 20px; color: #696969;">
                    หากคุณไม่ได้ทำการสมัครสมาชิก กรุณาปล่อยผ่านอีเมลฉบับนี้<br>
                    © 2026 Civic Horizon • BMA Digital Project
                  </p>
                </td>
              </tr>

            </table>

          </td>
        </tr>
      </table>

    </body>
    </html>
  `;

  return dispatchEmail({
    to: email,
    subject: 'ยืนยันการสมัครสมาชิก BMA Digital Project',
    html,
    actionLink: verifyLink,
  });
};

const escapeHtml = (value: string) =>
  value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character] ?? character);

type BrandedEmailOptions = {
  eyebrow: string;
  title: string;
  greeting: string;
  content: string;
  cta?: { label: string; href: string };
};

const renderBrandedEmail = ({
  eyebrow,
  title,
  greeting,
  content,
  cta,
}: BrandedEmailOptions) => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${escapeHtml(title)}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Sarabun:wght@400;500;700&display=swap" rel="stylesheet">
    </head>
    <body style="margin:0; padding:0; background-color:#f9f9ff; font-family:'Inter','Sarabun',sans-serif; -webkit-font-smoothing:antialiased;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f9f9ff; padding:48px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px; background-color:#ffffff; border:1px solid #D1CDC7; border-radius:8px; box-shadow:0 4px 16px rgba(0,0,0,0.04); overflow:hidden;">
              <tr>
                <td style="padding:48px 40px; text-align:left;">
                  <p style="margin:0 0 16px; font-size:14px; font-weight:700; line-height:16px; letter-spacing:0.04em; text-transform:uppercase; color:#00734B;">
                    ${escapeHtml(eyebrow)}
                  </p>
                  <h1 style="margin:0 0 24px; font-size:24px; font-weight:500; line-height:32px; color:#191c20; letter-spacing:-0.01em;">
                    ${escapeHtml(title)}
                  </h1>
                  <p style="margin:0 0 16px; font-size:16px; font-weight:400; line-height:24px; color:#191c20;">
                    ${escapeHtml(greeting)}
                  </p>
                  <div style="margin:0 0 32px; font-size:16px; font-weight:400; line-height:24px; color:#3f4942;">
                    ${content}
                  </div>
                  ${cta ? `
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin:0 auto 16px;">
                      <tr>
                        <td align="center" style="border-radius:4px; background-color:#00734B;">
                          <a href="${escapeHtml(cta.href)}" target="_blank" style="display:inline-block; padding:16px 36px; font-size:16px; font-weight:500; line-height:16px; color:#ffffff; text-decoration:none; border-radius:4px; background-color:#00734B; border:1px solid #00734B;">
                            ${escapeHtml(cta.label)}
                          </a>
                        </td>
                      </tr>
                    </table>
                  ` : ""}
                </td>
              </tr>
              <tr>
                <td style="padding:24px 40px; background-color:#f3f3fa; border-top:1px solid #D1CDC7; text-align:center;">
                  <p style="margin:0; font-size:13px; font-weight:400; line-height:20px; color:#696969;">
                    If you did not request this email, you can safely ignore it.<br>
                    © 2026 Civic Horizon · BMA Digital Project
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
`;

export const sendUsernameRecoveryEmail = async (email: string, username: string) => {
  const html = renderBrandedEmail({
    eyebrow: "Account Recovery",
    title: "Your username",
    greeting: "Hello,",
    content: `
      <p style="margin:0 0 16px;">We received a request to recover your BMA Digital Project username.</p>
      <p style="margin:0;">Your username is: <strong style="color:#00734B;">${escapeHtml(username)}</strong></p>
    `,
  });

  return dispatchEmail({
    to: email,
    subject: "Your BMA Digital Project username",
    text: `Your username is: ${username}`,
    html,
  });
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${getFrontendUrl()}/reset-password?token=${encodeURIComponent(token)}`;

  const html = renderBrandedEmail({
    eyebrow: "Account Security",
    title: "เปลี่ยนรหัสผ่าน",
    greeting: "สวัสดีครับ/ค่ะ,",
    content: `
      <p style="margin:0 0 16px;">เราได้รับการขอเปลี่ยนรหัสผ่าน</p>
      <p style="margin:0;">ลิ้งค์จะหมดอายุใน 30 นาที และสามารถใช้ได้ครั้งเดียว</p>

      <!-- 👇 เพิ่มส่วนที่เป็น Text Link สำรองเข้าไปตรงนี้ 👇 -->
      <div style="padding: 12px; background-color: #f3f3fa; border-radius: 6px; margin-bottom: 8px;">
        <p style="font-size: 14px; color: #666; margin: 0 0 8px 0;">
          หากปุ่มด้านล่างไม่สามารถคลิกได้ กรุณาคัดลอกลิงก์นี้ไปวางในเบราว์เซอร์ของคุณ:
        </p>
        <p style="font-size: 14px; margin: 0; word-break: break-all;">
          <span style="color: #007bff;">${resetLink}</span>
        </p>
      </div>
    `,
    cta: { label: "Reset Password", href: resetLink },
  });

  return dispatchEmail({
    to: email,
    subject: "การขอเปลี่ยนรหัสผ่านของระบบ BMA Digital Project ",
    text: `เปลี่ยนรหัสผ่านโดยใช้ลิ้งค์นี้. ลิ้งค์จะหมดอายุใน 30 นาที: ${resetLink}`,
    html,
    actionLink: resetLink,
  });
};

export const productionEmailService: EmailService = {
  sendVerificationEmail,
  sendUsernameRecoveryEmail,
  sendPasswordResetEmail,
};
