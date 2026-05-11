import { Router, Request, Response, NextFunction } from 'express';
import { AuditLogModel } from '../models/AuditLog';
import { verifyAuditLog } from '../services/auditService';
import { paginationSchema } from '../schemas/triggerSchema';
import { adminAuth } from '../middleware/adminAuth';

const router = Router();

router.get('/', adminAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = paginationSchema.parse(req.query);
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      AuditLogModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      AuditLogModel.countDocuments(),
    ]);
    res.json({ success: true, data: { items, total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/verify', adminAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const valid = await verifyAuditLog(req.params.id);
    res.json({ success: true, data: { valid } });
  } catch (err) {
    next(err);
  }
});

export default router;
