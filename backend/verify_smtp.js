require('dotenv').config({ path: './backend/.env' });
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  // For SendGrid: use TLS (587) instead of SSL (465) for better cloud compatibility
  secure: parseInt(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // Extended timeout settings for cloud environments (Render, etc.)
  connectionTimeout: 60000, // 60 seconds for connection
  socketTimeout: 60000, // 60 seconds for socket operations
  greetingTimeout: 10000, // 10 seconds for greeting
  // Connection pooling
  pool: {
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 1000,
    rateLimit: 14,
  },
  // TLS configuration for cloud providers
  tls: {
    rejectUnauthorized: false, // Required for cloud environments
    minVersion: "TLSv1.2", // Enforce minimum TLS version
  },
});

console.log("Testing SMTP configuration...");
console.log("Host:", process.env.SMTP_HOST);
console.log("Port:", process.env.SMTP_PORT);
console.log("User:", process.env.SMTP_USER);
console.log("Sender Email:", process.env.SMTP_FROM_EMAIL);
console.log("Connection Timeout: 30 seconds");
console.log("---");

// Verify with extended timeout (60 seconds for cloud environments)
const verificationTimeout = setTimeout(() => {
  console.error(
    "❌ SMTP Verification Timeout: Unable to connect after 60 seconds",
  );
  console.error("\nThis might indicate:");
  console.error("  1. Network connectivity issues on Render/cloud platform");
  console.error("  2. SMTP server (smtp.sendgrid.net) is unreachable");
  console.error("  3. Firewall blocking SMTP port 587 or 465");
  console.error("  4. Invalid SendGrid API key (username: 'apikey')");
  console.error("  5. Cloud provider blocking outbound SMTP connections");
  console.error("\nSendGrid Details:");
  console.error("  Host: smtp.sendgrid.net");
  console.error("  Port: 587 (TLS) or 465 (SSL)");
  console.error("  Username: apikey");
  console.error("  Password: Your SendGrid API Key");
  process.exit(1);
}, 60000);

transporter.verify((error, success) => {
  clearTimeout(verificationTimeout);
  if (error) {
    console.error("❌ SMTP Connection Error:", error.message);
    console.error("\nConfiguration Details:");
    console.error("  SMTP_HOST:", process.env.SMTP_HOST);
    console.error("  SMTP_PORT:", process.env.SMTP_PORT);
    console.error("  SMTP_USER:", process.env.SMTP_USER);
    console.error(
      "  Secure (TLS/SSL):",
      parseInt(process.env.SMTP_PORT) === 465,
    );
    console.error("\nTroubleshooting steps:");
    console.error("  1. Verify SMTP_HOST is 'smtp.sendgrid.net'");
    console.error(
      "  2. Use SMTP_PORT 587 (TLS) for better cloud compatibility",
    );
    console.error("  3. Confirm SMTP_USER is 'apikey' (exactly)");
    console.error("  4. Verify SMTP_PASS is your SendGrid API key");
    console.error("  5. Check SendGrid account is active and API key is valid");
    console.error("  6. Confirm Render allows outbound SMTP connections");
    console.error("\nFor SendGrid support: https://sendgrid.com/docs/");
    process.exit(1);
  } else {
    console.log("✅ SMTP Server is ready to take our messages");
    console.log("   Host:", process.env.SMTP_HOST);
    console.log("   Port:", process.env.SMTP_PORT);
    process.exit(0);
  }
});
