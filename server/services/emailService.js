const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Configure Nodemailer transporter with Brevo SMTP details
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_SERVER || 'smtp-relay.brevo.com',
  port: parseInt(process.env.BREVO_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.BREVO_LOGIN,
    pass: process.env.BREVO_API_KEY
  }
});

// Load and populate HTML template
function loadTemplate(templateName, variables) {
  const filePath = path.join(__dirname, '../templates/email', templateName);
  let html = fs.readFileSync(filePath, 'utf-8');
  Object.entries(variables).forEach(([key, value]) => {
    html = html.replaceAll(`{{${key}}}`, value);
  });
  return html;
}

async function sendEmail({ to, subject, templateName, variables }) {
  const html = loadTemplate(templateName, variables);

  const mailOptions = {
    from: `Noted <${process.env.BREVO_FROM_EMAIL || 'noreply@notedapp.site'}>`,
    to,
    subject,
    html
  };

  return await transporter.sendMail(mailOptions);
}

module.exports = {
  sendVerificationEmail: (to, username, token) =>
    sendEmail({
      to, 
      subject: 'Verify your Noted account',
      templateName: 'verifyEmail.html',
      variables: {
        username,
        verify_url: `${process.env.CLIENT_URL}/verify-email?token=${token}`,
        expiry_hours: process.env.TOKEN_EXPIRY_HOURS || 16,
      },
    }),

  sendPasswordResetEmail: (to, username, token) =>
    sendEmail({
      to,
      subject: 'Reset your Noted password',
      templateName: 'resetPassword.html',
      variables: {
        username,
        reset_url: `${process.env.CLIENT_URL}/reset-password?token=${token}`,
        expiry_hours: process.env.TOKEN_EXPIRY_HOURS || 16,
      },
    }),

  sendPasswordChangedEmail: (to, username) =>
    sendEmail({
      to,
      subject: 'Your Noted password was changed',
      templateName: 'passwordChanged.html',
      variables: {
        username,
        changed_at: new Date().toLocaleString('en-US', {
          dateStyle: 'long', timeStyle: 'short'
        }),
        support_url: `${process.env.CLIENT_URL}/support`,
      },
    }),
};
