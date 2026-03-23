const parseBoolean = (value, fallback = true) => {
  if (typeof value === 'undefined') {
    return fallback;
  }

  return String(value).toLowerCase() !== 'false';
};

function getMailjetConfig() {
  return {
    enabled: parseBoolean(process.env.MAILJET_ENABLED, true),
    apiKey: process.env.MAILJET_API_KEY || '',
    secretKey: process.env.MAILJET_SECRET_KEY || '',
    fromEmail: process.env.MAILJET_FROM_EMAIL || '',
    fromName: process.env.MAILJET_FROM_NAME || 'U-Play'
  };
}

export async function sendLoginOtpEmail({ toEmail, toName, otp }) {
  const config = getMailjetConfig();

  if (!config.enabled) {
    console.log(`MAILJET disabled. Login OTP for ${toEmail}: ${otp}`);
    return;
  }

  if (!config.apiKey || !config.secretKey || !config.fromEmail) {
    const missingKeys = [
      !config.apiKey ? 'MAILJET_API_KEY' : '',
      !config.secretKey ? 'MAILJET_SECRET_KEY' : '',
      !config.fromEmail ? 'MAILJET_FROM_EMAIL' : ''
    ].filter(Boolean);

    throw new Error(`Mailjet configuration is incomplete: missing ${missingKeys.join(', ')}`);
  }

  const response = await fetch('https://api.mailjet.com/v3.1/send', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${config.apiKey}:${config.secretKey}`).toString('base64')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      Messages: [
        {
          From: {
            Email: config.fromEmail,
            Name: config.fromName
          },
          To: [
            {
              Email: toEmail,
              Name: toName || toEmail
            }
          ],
          Subject: 'Your U-Play login verification code',
          TextPart: `Your U-Play OTP is ${otp}. It expires in 10 minutes.`,
          HTMLPart: `
            <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
              <h2 style="margin-bottom: 12px;">U-Play Login Verification</h2>
              <p>Use the following one-time password to complete your sign in:</p>
              <div style="font-size: 28px; font-weight: 700; letter-spacing: 8px; padding: 14px 18px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; display: inline-block;">
                ${otp}
              </div>
              <p style="margin-top: 16px;">This code expires in 10 minutes.</p>
              <p style="color: #475569;">If you did not request this login, you can ignore this email.</p>
            </div>
          `
        }
      ]
    })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.Messages?.[0]?.Errors?.[0]?.ErrorMessage || 'Unable to send OTP email');
  }
}
