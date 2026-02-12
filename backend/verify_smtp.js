require('dotenv').config({ path: './backend/.env' });
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

console.log('Testing SMTP configuration...');
console.log('Host:', process.env.SMTP_HOST);
console.log('Port:', process.env.SMTP_PORT);
console.log('User:', process.env.SMTP_USER);
console.log('Sender Email:', process.env.SMTP_FROM_EMAIL);

transporter.verify((error, success) => {
    if (error) {
        console.error('❌ SMTP Connection Error:', error);
        process.exit(1);
    } else {
        console.log('✅ SMTP Server is ready to take our messages');
        process.exit(0);
    }
});
