import jwt from 'jsonwebtoken';
import { JwtPayload } from '../middleware/auth.middleware';

const QR_SECRET = process.env.QR_SECRET || 'qr-secret-change-in-production';

export const generateQrToken = (payload: Record<string, any>): string => {
  return jwt.sign(payload, QR_SECRET, { expiresIn: '24h' });
};

export const verifyQrToken = (token: string): { valid: boolean; payload?: any; status?: string } => {
  try {
    const decoded = jwt.verify(token, QR_SECRET);
    return { valid: true, payload: decoded };
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') return { valid: false, status: 'EXPIRED' };
    return { valid: false, status: 'INVALID' };
  }
};
