import { Router, Request, Response, NextFunction } from 'express';
import { getQueueMetrics } from '../services/queueService';
import { QueueMetricModel } from '../models/QueueMetric';
import { adminAuth } from '../middleware/adminAuth';

const router = Router();

router.get('/metrics', adminAuth, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const live = await getQueueMetrics();
    const history = await QueueMetricModel.find().sort({ createdAt: -1 }).limit(100).lean();
    res.json({ success: true, data: { live, history } });
  } catch (err) {
    next(err);
  }
});

export default router;
