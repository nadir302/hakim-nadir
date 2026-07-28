import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';

const AUDIT_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];
const SKIP_PATHS = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh-token', '/api/health'];

export async function auditLogger(req: Request, res: Response, next: NextFunction) {
  if (!AUDIT_METHODS.includes(req.method) || SKIP_PATHS.some(p => req.path.startsWith(p)) || !req.user) {
    return next();
  }

  const originalJson = res.json.bind(res);
  res.json = function (body: any) {
    if (res.statusCode < 400) {
      const entity = req.path.split('/')[2] || 'unknown';
      prisma.activityLog.create({
        data: {
          action: `${req.method} ${req.path}`,
          entity: entity.charAt(0).toUpperCase() + entity.slice(1),
          entityId: req.params.id || body?.id || null,
          details: JSON.stringify({
            method: req.method,
            path: req.path,
            body: sanitizeBody(req.body),
            statusCode: res.statusCode,
          }),
          userId: req.user!.userId,
        },
      }).catch(() => {});
    }
    return originalJson(body);
  };

  next();
}

function sanitizeBody(body: any): any {
  if (!body) return {};
  const sanitized = { ...body };
  delete sanitized.password;
  delete sanitized.currentPassword;
  delete sanitized.newPassword;
  delete sanitized.confirmPassword;
  delete sanitized.refreshToken;
  return sanitized;
}
