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

// ✅ ONLY mail-related function here
export async function sendLoginOtpEmail({ toEmail, toName, otp }) {
  const config = getMailjetConfig();

  // 🔥 Safe mode (prevents crashes)
  if (!config.enabled) {
    console.log(`MAILJET disabled. Login OTP for ${toEmail}: ${otp}`);
    return;
  }

  if (!config.apiKey || !config.secretKey || !config.fromEmail) {
    const missingKeys = [
      !config.apiKey && 'MAILJET_API_KEY',
      !config.secretKey && 'MAILJET_SECRET_KEY',
      !config.fromEmail && 'MAILJET_FROM_EMAIL'
    ].filter(Boolean);

    throw new Error(`Mailjet config missing: ${missingKeys.join(', ')}`);
  }

  try {
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
            TextPart: `Your OTP is ${otp}. It expires in 10 minutes.`,
            HTMLPart: `
              <div style="font-family: Arial, sans-serif;">
                <h2>U-Play Login Verification</h2>
                <p>Your OTP:</p>
                <h1 style="letter-spacing:5px;">${otp}</h1>
                <p>Expires in 10 minutes.</p>
              </div>
            `
          }
        ]
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data?.Messages?.[0]?.Errors?.[0]?.ErrorMessage ||
        'Failed to send OTP email'
      );
    }

  } catch (error) {
    console.error("Mailjet Error:", error.message);
    throw error;
  }
}