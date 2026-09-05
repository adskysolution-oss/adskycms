import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
      html,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

export const sendOTPEmail = async (email, otp, type = 'registration') => {
  const subject = type === 'registration' 
    ? 'Verify your AdSky Account' 
    : 'Reset your AdSky Password';
  
  const title = type === 'registration' 
    ? 'Welcome to AdSky Solution!' 
    : 'Password Reset Request';

  const message = type === 'registration'
    ? 'Please use the following OTP to verify your account. This OTP is valid for 10 minutes.'
    : 'You requested a password reset. Use the OTP below to set a new password. If you did not request this, please ignore this email.';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #333;">${title}</h2>
      <p style="color: #555;">${message}</p>
      <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #000; border-radius: 5px; margin: 20px 0;">
        ${otp}
      </div>
      <p style="color: #888; font-size: 12px;">This is an automated email. Please do not reply.</p>
    </div>
  `;

  return sendEmail({ to: email, subject, html });
};
