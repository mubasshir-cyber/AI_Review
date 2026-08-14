import { Injectable, UnauthorizedException, ForbiddenException, BadRequestException } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { db } from '../../../database/store';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.warn('⚠️ JWT_SECRET environment variable is missing. Authentication functionality requires JWT_SECRET.');
}

@Injectable()
export class AuthService {
  async login(loginIdOrEmail: string, password?: string) {
    const identifier = loginIdOrEmail?.trim();
    if (!identifier) {
      throw new BadRequestException('Login ID is required.');
    }
    if (!password || !password.trim()) {
      throw new BadRequestException('Password is required.');
    }

    // Database Authentication
    const result = await db.authenticateUser(identifier, password);

    if (result.errorReason === 'INACTIVE') {
      throw new ForbiddenException('Account is inactive. Please contact your administrator.');
    }

    if (result.errorReason === 'NOT_FOUND' || result.errorReason === 'INVALID_PASSWORD' || !result.user) {
      throw new UnauthorizedException('Invalid Login ID or password. Please check your credentials.');
    }

    const user = result.user;

    if (user.businessId) {
      const business = await db.getBusinessById(user.businessId);
      if (business && business.status === 'SUSPENDED') {
        throw new ForbiddenException('Your business account is suspended. Please contact support.');
      }
    }

    // Do not return password hash to client
    const { password: _, ...sanitizedUser } = user;

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      businessId: user.businessId,
    };

    const expiresIn = (process.env.JWT_EXPIRES_IN || '24h') as any;
    const accessToken = jwt.sign(payload, JWT_SECRET as string, { expiresIn });

    return {
      message: 'Authentication successful',
      data: {
        user: sanitizedUser,
        accessToken,
      },
    };
  }

  async getProfile(userId: string) {
    if (!userId) {
      throw new UnauthorizedException('User identity missing from token.');
    }
    const user = await db.getUserById(userId);
    if (!user) {
      throw new UnauthorizedException('User profile not found in database.');
    }
    if (user.status === 'INACTIVE') {
      throw new ForbiddenException('Account is inactive. Access denied.');
    }

    const { password: _, ...sanitizedUser } = user;
    return {
      message: 'Profile retrieved successfully',
      data: { user: sanitizedUser },
    };
  }

  async forgotPassword(email?: string) {
    if (!email || !email.trim()) {
      throw new BadRequestException('Email is required.');
    }
    
    const user = await db.getUserByEmail(email.trim());
    if (user) {
      // Generate Token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiration
      
      await db.savePasswordResetToken(user.email, token, expiresAt);

      // Send Email using Nodemailer
      try {
        let transporter;
        
        if (process.env.SMTP_HOST && process.env.SMTP_USER) {
          // Use real SMTP credentials from .env
          transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587', 10),
            secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          });
        } else {
          // Fallback to Ethereal Email for testing if no SMTP is configured
          const testAccount = await nodemailer.createTestAccount();
          transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
              user: testAccount.user,
              pass: testAccount.pass,
            },
          });
        }

        const frontendUrl = (process.env.APP_URL || 'http://localhost:5173').replace(/\/$/, '');
        const resetUrl = `${frontendUrl}/login?token=${token}`;
        
        const info = await transporter.sendMail({
          from: `"ReviewScore AI" <${process.env.SMTP_USER || 'support@reviewscore.ai'}>`,
          to: user.email,
          subject: 'Password Reset Request - ReviewScore AI',
          text: `You requested a password reset for your ReviewScore AI account.\n\nClick the link below to set your new password:\n\n${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you did not request a password reset, please ignore this email.`,
          html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f5f7fb; padding: 30px; margin: 0;">
  <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e8edf5;">
    <div style="background: #2563EB; padding: 32px 40px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800;">ReviewScore AI</h1>
      <p style="color: #bfdbfe; margin: 8px 0 0; font-size: 13px;">Password Reset Request</p>
    </div>
    <div style="padding: 36px 40px;">
      <p style="color: #1e293b; font-size: 15px; margin: 0 0 16px;">Hi there,</p>
      <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">You requested a password reset for your account. Click the button below to create a new password. This link is valid for <strong>1 hour</strong>.</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetUrl}" style="display: inline-block; background: #2563EB; color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 10px; font-size: 15px; font-weight: 700;">Reset My Password</a>
      </div>
      <p style="color: #94a3b8; font-size: 12px; margin: 24px 0 8px;">If the button above doesn't work, copy and paste this link into your browser:</p>
      <p style="color: #2563EB; font-size: 12px; word-break: break-all; margin: 0; padding: 12px; background: #f1f5f9; border-radius: 8px;">${resetUrl}</p>
      <p style="color: #94a3b8; font-size: 12px; margin: 24px 0 0; border-top: 1px solid #e8edf5; padding-top: 16px;">If you didn't request this, you can safely ignore this email. Your password won't change.</p>
    </div>
  </div>
</body>
</html>
`
        });

        console.log(`[Email Mock] Password reset link sent to: ${user.email}`);
        console.log(`[Email Mock] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      } catch (error) {
        console.error('Failed to send email:', error);
      }
    }

    // We always return success to prevent email enumeration attacks
    return {
      message: 'If an account with that email exists, a reset link has been sent.',
    };
  }

  async resetPasswordWithToken(dto: { token?: string; newPassword?: string }) {
    if (!dto.token || !dto.token.trim()) {
      throw new BadRequestException('Invalid or missing token.');
    }
    if (!dto.newPassword || !dto.newPassword.trim()) {
      throw new BadRequestException('New password is required.');
    }
    if (dto.newPassword.trim().length < 6) {
      throw new BadRequestException('New password must be at least 6 characters long.');
    }

    const user = await db.getUserByResetToken(dto.token.trim());
    if (!user) {
      throw new BadRequestException('Invalid or expired password reset token.');
    }

    // IMMEDIATELY invalidate the token before updating the password.
    // This prevents the token from being reused even if the password update
    // fails halfway, and prevents race-condition double-use attacks.
    await db.clearPasswordResetToken(user.id);

    const updated = await db.updateUserPassword(user.id, dto.newPassword.trim());
    if (updated) {
      return { message: 'Password has been successfully reset. You can now login.' };
    }
    
    throw new BadRequestException('Failed to update password.');
  }

  async resetPassword(requestorId: string, dto: { targetEmail?: string; targetUserId?: string; newPassword?: string }) {
    if (!dto.newPassword || !dto.newPassword.trim()) {
      throw new BadRequestException('New password is required.');
    }
    if (dto.newPassword.trim().length < 6) {
      throw new BadRequestException('New password must be at least 6 characters long.');
    }

    const requestor = await db.getUserById(requestorId);
    if (!requestor) {
      throw new UnauthorizedException('User account not found.');
    }

    const target = dto.targetEmail || dto.targetUserId || requestor.id;

    if (requestor.role !== 'AGENCY_ADMIN' && target !== requestor.id && target !== requestor.email) {
      throw new ForbiddenException('You do not have permission to reset passwords for other accounts.');
    }

    const updated = await db.updateUserPassword(target, dto.newPassword.trim());
    if (!updated) {
      throw new BadRequestException('Target account not found or password update failed.');
    }

    return { message: 'Password reset successfully' };
  }
}
