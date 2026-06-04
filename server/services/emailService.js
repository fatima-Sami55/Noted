const fs = require('fs');
const path = require('path');
const https = require('https');

// Load and populate HTML template
function loadTemplate(templateName, variables) {
  const filePath = path.join(__dirname, '../templates/email', templateName);
  let html = fs.readFileSync(filePath, 'utf-8');
  Object.entries(variables).forEach(([key, value]) => {
    html = html.replaceAll(`{{${key}}}`, value);
  });
  return html;
}

function sendEmailViaHttp(payload, apiKey) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const options = {
      hostname: 'api.brevo.com',
      port: 443,
      path: '/v3/smtp/email',
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(body || '{}'));
        } else {
          reject(new Error(`Brevo API Error (${res.statusCode}): ${body}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(data);
    req.end();
  });
}

async function sendEmail({ to, subject, templateName, variables }) {
  const html = loadTemplate(templateName, variables);

  const payload = {
    sender: {
      name: 'Noted',
      email: process.env.BREVO_FROM_EMAIL || 'noreply@notedapp.site'
    },
    to: [
      {
        email: to
      }
    ],
    subject,
    htmlContent: html
  };

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error('BREVO_API_KEY environment variable is not defined.');
  }

  return await sendEmailViaHttp(payload, apiKey);
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
