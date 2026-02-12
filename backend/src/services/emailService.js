const nodemailer = require('nodemailer');
const axios = require("axios");

// Detect if running on Render (check for Render environment)
const isRender =
  process.env.RENDER === "true" || process.env.RENDER_EXTERNAL_URL;

// Simple logger for nodemailer (only on Render for debugging)
const createLogger = () => {
  if (!isRender) return false; // No logging on local
  return {
    trace: (msg) => console.log("📧 [TRACE]", msg),
    debug: (msg) => console.log("📧 [DEBUG]", msg),
    info: (msg) => console.log("📧 [INFO]", msg),
    warn: (msg) => console.warn("📧 [WARN]", msg),
    error: (msg) => console.error("📧 [ERROR]", msg),
  };
};

// SMTP Transporter (for local development)
let smtpTransporter = null;
if (!isRender) {
  smtpTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: parseInt(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 90000,
    socketTimeout: 90000,
    greetingTimeout: 30000,
    pool: {
      maxConnections: 2,
      maxMessages: 50,
      rateDelta: 2000,
      rateLimit: 5,
    },
    tls: {
      rejectUnauthorized: false,
      minVersion: "TLSv1.2",
    },
    logger: createLogger(),
  });
}

// Verify SMTP connection on startup (local only)
if (smtpTransporter) {
  const verifyWithTimeout = () => {
    const timeout = setTimeout(() => {
      console.error(
        "📧 SMTP Verification Timeout: Unable to connect after 90 seconds",
      );
    }, 90000);

    smtpTransporter.verify((error, success) => {
      clearTimeout(timeout);
      if (error) {
        console.error("📧 SMTP Connection Error:", error.message);
      } else {
        console.log("📧 SMTP Server is ready to take our messages");
      }
    });
  };
  verifyWithTimeout();
}

// SendGrid API function (for Render production)
const sendViaAPI = async (to, subject, html) => {
  const apiKey = process.env.SMTP_PASS; // SendGrid API key
  if (!apiKey || !apiKey.startsWith("SG.")) {
    throw new Error("Invalid SendGrid API key");
  }

  try {
    const response = await axios.post(
      "https://api.sendgrid.com/v3/mail/send",
      {
        personalizations: [
          {
            to: [{ email: to }],
            subject: subject,
          },
        ],
        from: {
          email: process.env.SMTP_FROM_EMAIL,
          name: process.env.SMTP_FROM_NAME,
        },
        content: [
          {
            type: "text/html",
            value: html,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      },
    );

    console.log("📧 Message sent via SendGrid API");
    return response.data;
  } catch (error) {
    console.error(
      "📧 SendGrid API Error:",
      error.response?.data || error.message,
    );
    throw new Error("Failed to send email via SendGrid API");
  }
};

class EmailService {
  /**
   * Retry logic with exponential backoff
   */
  static async retryWithBackoff(fn, maxRetries = 3) {
    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        console.warn(
          `📧 Email send attempt ${attempt} failed: ${error.message}`,
        );

        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt - 1) * 1000;
          console.log(`📧 Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
    throw lastError;
  }

  /**
   * Universal email sender - uses API on Render, SMTP locally
   */
  static async sendEmail(to, subject, html) {
    try {
      // Use SendGrid API on Render, SMTP locally
      if (isRender) {
        console.log("📧 Using SendGrid API (Render environment)");
        return await this.retryWithBackoff(() => sendViaAPI(to, subject, html));
      } else {
        console.log("📧 Using SMTP (Local environment)");
        const mailOptions = {
          from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
          to,
          subject,
          html,
        };
        return await this.retryWithBackoff(() =>
          smtpTransporter.sendMail(mailOptions),
        );
      }
    } catch (error) {
      console.error("📧 Email Sending Error (after retries):", error.message);
      console.error("📧 To:", to);
      console.error("📧 Subject:", subject);
      throw new Error("Failed to send email: " + error.message);
    }
  }

  // Send account verification email
  static async sendVerificationEmail(
    recipientEmail,
    verificationUrl,
    firstName = "User",
  ) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #2563eb;">Welcome to Habayta Jobs!</h2>
        <p>Hi ${firstName},</p>
        <p>Thank you for registering. Please verify your email address to active your account:</p>
        <a href="${verificationUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Verify Email Address</a>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #999;">If you didn't create an account, you can safely ignore this email.</p>
      </div>
    `;

    return this.sendEmail(
      recipientEmail,
      "Verify your email - Habayta Jobs",
      html,
    );
  }

  // Send password reset email
  static async sendPasswordResetEmail(recipientEmail, resetUrl) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #2563eb;">Reset Your Password</h2>
        <p>You requested a password reset for your Habayta Jobs account.</p>
        <p>Click the button below to set a new password. This link is valid for 30 minutes:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #999;">Sent by Habayta Jobs Security Team</p>
      </div>
    `;

    return this.sendEmail(
      recipientEmail,
      "Reset your password - Habayta Jobs",
      html,
    );
  }

  // Send OTP email
  static async sendOtpEmail(recipientEmail, otp) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #2563eb;">Your Verification Code</h2>
        <p>Please use the following One-Time Password (OTP) to complete your verification:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; text-align: center; color: #2563eb; padding: 20px; background: #f8fafc; border-radius: 8px;">
          ${otp}
        </div>
        <p>This code will expire in 10 minutes.</p>
      </div>
    `;

    return this.sendEmail(
      recipientEmail,
      "Your Verification Code - Habayta Jobs",
      html,
    );
  }

  // Send application confirmation
  static async sendApplicationConfirmation(
    recipientEmail,
    jobTitle,
    companyName,
  ) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #10b981;">Application Submitted!</h2>
        <p>Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been received.</p>
        <p>The employer will review your application and we'll notify you of any updates.</p>
      </div>
    `;

    return this.sendEmail(
      recipientEmail,
      "Application submitted successfully - Habayta Jobs",
      html,
    );
  }

  // Send application status update
  static async sendApplicationStatusUpdate(
    recipientEmail,
    jobTitle,
    status,
    message = "",
  ) {
    const color =
      status === "accepted"
        ? "#10b981"
        : status === "rejected"
        ? "#ef4444"
        : "#2563eb";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: ${color};">Application Update</h2>
        <p>Your application for <strong>${jobTitle}</strong> has been updated to: <strong>${status.toUpperCase()}</strong></p>
        ${message ? `<p><strong>Employer Message:</strong> ${message}</p>` : ""}
        <p>Good luck!</p>
      </div>
    `;

    return this.sendEmail(
      recipientEmail,
      `Application ${
        status.charAt(0).toUpperCase() + status.slice(1)
      } - Habayta Jobs`,
      html,
    );
  }

  // Send welcome email after verification
  static async sendWelcomeEmail(recipientEmail, firstName = "User") {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #10b981;">Welcome to Habayta Jobs, ${firstName}! 🎉</h2>
        <p>Your email has been verified successfully and your account is now fully active.</p>
        <p>Here's what you can do next:</p>
        <ul style="line-height: 2;">
          <li>🔍 Browse and search for jobs that match your skills</li>
          <li>📝 Complete your profile to stand out to employers</li>
          <li>📄 Upload your resume for quick applications</li>
          <li>💾 Save jobs you're interested in</li>
        </ul>
        <a href="${process.env.CLIENT_URL}/jobs" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Start Exploring Jobs</a>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #999;">Welcome aboard! — The Habayta Jobs Team</p>
      </div>
    `;

    return this.sendEmail(recipientEmail, "Welcome to Habayta Jobs! 🎉", html);
  }

  // Send job matching notification
  static async sendJobMatchingEmail(
    recipientEmail,
    jobTitle,
    jobUrl,
    companyName,
  ) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #2563eb;">New Job Match!</h2>
        <p>A new job that matches your profile has been posted: <strong>${jobTitle}</strong> by <strong>${companyName}</strong></p>
        <a href="${jobUrl}" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">View Job Details</a>
      </div>
    `;

    return this.sendEmail(
      recipientEmail,
      "New job matching your profile - Habayta Jobs",
      html,
    );
  }
}

module.exports = EmailService;
