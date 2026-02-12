require('dotenv').config({ path: './backend/.env' });
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT == 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // Connection timeout settings
  connectionTimeout: 30000, // 30 seconds
  socketTimeout: 30000, // 30 seconds
  // Connection pooling
  pool: {
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 1000,
    rateLimit: 14,
  },
  // TLS configuration
  tls: {
    rejectUnauthorized: false,
  },
});

console.log("Testing SMTP configuration...");
console.log("Host:", process.env.SMTP_HOST);
console.log("Port:", process.env.SMTP_PORT);
console.log("User:", process.env.SMTP_USER);
console.log("Sender Email:", process.env.SMTP_FROM_EMAIL);
console.log("Connection Timeout: 30 seconds");
console.log("---");

// Verify with timeout
const verificationTimeout = setTimeout(() => {
  console.error(
    "❌ SMTP Verification Timeout: Unable to connect after 10 seconds",
  );
  console.error("This might indicate:");
  console.error("  1. Network connectivity issues");
  console.error("  2. SMTP server is down or unreachable");
  console.error("  3. Firewall blocking the SMTP port");
  console.error("  4. Invalid SMTP credentials");
  process.exit(1);
}, 10000);

transporter.verify((error, success) => {
  clearTimeout(verificationTimeout);
  if (error) {
    console.error("❌ SMTP Connection Error:", error.message);
    console.error("\nTroubleshooting steps:");
    console.error("  1. Check SMTP_HOST is correct");
    console.error("  2. Verify SMTP_PORT is accessible (usually 587 or 465)");
    console.error("  3. Confirm SMTP_USER and SMTP_PASS");
    console.error("  4. Ensure firewall allows SMTP connections");
    console.error("  5. Check if your hosting provider blocks SMTP ports");
    process.exit(1);
  } else {
    console.log("✅ SMTP Server is ready to take our messages");
    process.exit(0);
  }
});
