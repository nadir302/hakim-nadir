import nodemailer from 'nodemailer';
import { config } from '../config';

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.port === 465,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: SendEmailOptions) => {
  if (config.env === 'test') return;

  try {
    await transporter.sendMail({
      from: `"Smart Shuttle" <${config.smtp.from}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  } catch (error) {
    console.error('Email send failed:', error);
  }
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const url = `${config.frontendUrl}/verify-email?token=${token}`;
  await sendEmail({
    to: email,
    subject: 'Verify your email - Smart Shuttle',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Smart Shuttle!</h2>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${url}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px;">
          Verify Email
        </a>
        <p style="margin-top: 20px; color: #666;">This link expires in 24 hours.</p>
      </div>
    `,
  });
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const url = `${config.frontendUrl}/reset-password?token=${token}`;
  await sendEmail({
    to: email,
    subject: 'Reset your password - Smart Shuttle',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${url}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px;">
          Reset Password
        </a>
        <p style="margin-top: 20px; color: #666;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
};
