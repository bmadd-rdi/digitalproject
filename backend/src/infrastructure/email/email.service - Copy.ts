// src/infrastructure/email/email.service.ts
import nodemailer from 'nodemailer';
import type { EmailService } from "../../shared/app/services";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // สำหรับ port 587 ให้ใช้ false
  requireTLS: true, // บังคับใช้ TLS ตาม config เดิม
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // เพิ่มส่วนนี้ถ้า server ของ BMA มีปัญหาเรื่องใบรับรอง SSL ภายใน
  tls: {
    rejectUnauthorized: false
  }
});

export const sendVerificationEmail = async (email: string, token: string, name: string) => {
  const verifyLink = `${process.env.FRONTEND_URL}/verify?token=${token}`;

  try {
    await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
      to: email,
      subject: 'ยืนยันการสมัครสมาชิก BMA Digital Project',
      html: `
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
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("Email sending failed:", error);
    return { success: false, error };
  }
};

const escapeHtml = (value: string) =>
  value.replace(/[&<>'\"]/g, (character) => ({
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
  try {
    await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
      to: email,
      subject: "Your BMA Digital Project username",
      text: `Your username is: ${username}`,
      html: renderBrandedEmail({
        eyebrow: "Account Recovery",
        title: "Your username",
        greeting: "Hello,",
        content: `
          <p style="margin:0 0 16px;">We received a request to recover your BMA Digital Project username.</p>
          <p style="margin:0;">Your username is: <strong style="color:#00734B;">${escapeHtml(username)}</strong></p>
        `,
      }),
    });
    return { success: true };
  } catch (error) {
    console.error("Username recovery email failed:", error);
    return { success: false, error };
  }
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}`;

  try {
    await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
      to: email,
      subject: "Reset your BMA Digital Project password",
      text: `Reset your password using this link. The link expires in 30 minutes: ${resetLink}`,
      html: renderBrandedEmail({
        eyebrow: "Account Security",
        title: "Reset your password",
        greeting: "Hello,",
        content: `
          <p style="margin:0 0 16px;">We received a request to reset your BMA Digital Project password.</p>
          <p style="margin:0;">This secure link expires in <strong>30 minutes</strong> and can only be used once.</p>
        `,
        cta: { label: "Reset Password", href: resetLink },
      }),
    });
    return { success: true };
  } catch (error) {
    console.error("Password reset email failed:", error);
    return { success: false, error };
  }
};

export const productionEmailService: EmailService = {
  sendVerificationEmail,
  sendUsernameRecoveryEmail,
  sendPasswordResetEmail,
};
