const path = require('path');

// Load .env file - works from both backend/ and project root directories
const envPath = path.join(__dirname, '.env');
require('dotenv').config({ path: envPath });

const nodemailer = require('nodemailer');

// Detect if running on Render (check for Render environment)
const isRender = process.env.RENDER === 'true' || process.env.RENDER_EXTERNAL_URL;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: isRender ? 465 : (parseInt(process.env.SMTP_PORT) || 587),
  // For Render: always use SSL (465) - TLS (587) is often blocked
  // For local/other: use TLS (587) which is more reliable
  secure: isRender ? true : (parseInt(process.env.SMTP_PORT) === 465),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // Extended timeout settings for cloud environments
  connectionTimeout: 90000, // 90 seconds for connection
  socketTimeout: 90000, // 90 seconds for socket operations
  greetingTimeout: 30000, // 30 seconds for greeting (SSL handshake)
  // Connection pooling
  pool: {
    maxConnections: 2,   // Reduced for Render stability
    maxMessages: 50,     // Reduced for Render stability
    rateDelta: 2000,     // Slower rate
    rateLimit: 5,        // Max 5 messages per 2 seconds
  },
  // TLS configuration
  tls: {
    rejectUnauthorized: false,
    minVersion: 'TLSv1.2',
  },
  // Debug mode
  logger: isRender,
  debug: isRender,
});

console.log('Testing SMTP configuration...');
console.log('Environment: ' + (isRender ? '🔴 RENDER' : '🟢 Local/Other'));
console.log('Host:', process.env.SMTP_HOST);
console.log('Port:', isRender ? '465 (SSL - Render mode)' : process.env.SMTP_PORT + ' (TLS)');
console.log('User:', process.env.SMTP_USER);
console.log('Sender Email:', process.env.SMTP_FROM_EMAIL);
console.log('Connection Timeout: 90 seconds');
console.log('---');

// Verify with extended timeout (90+ seconds for cloud SSL handshake)
const verificationTimeout = setTimeout(() => {
  console.error(
    '\n❌ SMTP Verification Timeout: Unable to connect after 90 seconds',
  );
  console.error('Environment Analysis:');
  console.error('  Running on: ' + (isRender ? 'RENDER' : 'Local/Development'));
  console.error('  Port in use: ' + (isRender ? '465 (SSL)' : '587 (TLS)'));
  console.error('\nThis might indicate:');
  console.error('  1. Network latency during SSL/TLS handshake');
  console.error('  2. SendGrid API key is invalid or expired');
  console.error('  3. SendGrid account needs email verification');
  console.error('  4. Firewall blocking SMTP connections');
  console.error('  5. Render environment variables not set correctly');
  console.error('\nQuick fixes for Render:');
  console.error('  1. Regenerate SendGrid API key and update SMTP_PASS');
  console.error('  2. Verify sender email is authorized in SendGrid');
  console.error('  3. Check Render Environment Variables are properly set');
  console.error('  4. Ensure RENDER environment variable is set on Render');
  process.exit(1);
}, 90000);

transporter.verify((error, success) => {
  clearTimeout(verificationTimeout);
  if (error) {
    console.error('\n❌ SMTP Connection Error:', error.message);
    console.error('\nConfiguration Details:');
    console.error('  SMTP_HOST:', process.env.SMTP_HOST);
    console.error(
      '  SMTP_PORT:',
      isRender ? '465 (auto-switched for Render)' : process.env.SMTP_PORT,
    );
    console.error('  SMTP_USER:', process.env.SMTP_USER);
    console.error('  Environment: ' + (isRender ? 'RENDER' : 'Local'));
    console.error('  Secure (TLS/SSL):', isRender ? 'SSL (465)' : 'TLS (587)');

    console.error('\n🔧 Troubleshooting steps:');
    console.error('  1. Verify SMTP_HOST is \'smtp.sendgrid.net\'');
    console.error('  2. Confirm SMTP_USER is \'apikey\' (exactly)');
    console.error(
      '  3. Verify SMTP_PASS is your SendGrid API key (starts with SG.)',
    );
    console.error('  4. Check SendGrid account is active');
    console.error('  5. For Render: Verify RENDER env variable is set');
    console.error('  6. For Render: Check outbound SMTP is allowed');

    console.error('\n📧 SendGrid Configuration:');
    console.error('  Standard Host: smtp.sendgrid.net');
    console.error('  Port for Render: 465 (SSL/TLS)');
    console.error('  Port for Local: 587 (TLS)');
    console.error('\nFor more help: https://sendgrid.com/docs/');
    process.exit(1);
  } else {
    console.log('\n✅ SMTP Server is ready to take our messages');
    console.log('   Host:', process.env.SMTP_HOST);
    console.log('   Port:', isRender ? '465 (SSL)' : process.env.SMTP_PORT + ' (TLS)');
    console.log('   Environment:', isRender ? '✅ RENDER' : '✅ Local/Other');
    console.log('\n🎉 Configuration successful!');
    process.exit(0);
  }
});
   
