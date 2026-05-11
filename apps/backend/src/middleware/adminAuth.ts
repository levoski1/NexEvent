import { Request, Response, NextFunction } from 'express';
import { config } from '@nexevent/config';

export function adminAuth(req: Request, res: Response, next: NextFunction): void {
  const key = req.headers['x-admin-key'] ?? req.headers['authorization']?.replace('Bearer ', '');
  if (key !== config.ADMIN_API_KEY) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }
  next();
}
