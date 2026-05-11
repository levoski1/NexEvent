import { Router, Request, Response, NextFunction } from 'express';
import { createTriggerSchema, updateTriggerSchema, paginationSchema } from '../schemas/triggerSchema';
import * as triggerService from '../services/triggerService';

const router = Router();

/**
 * @openapi
 * /triggers:
 *   get:
 *     summary: List all triggers
 *     tags: [Triggers]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Paginated trigger list
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = paginationSchema.parse(req.query);
    const result = await triggerService.listTriggers(page, limit);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trigger = await triggerService.getTrigger(req.params.id);
    res.json({ success: true, data: trigger });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createTriggerSchema.parse(req.body);
    const trigger = await triggerService.createTrigger(data as Parameters<typeof triggerService.createTrigger>[0]);
    res.status(201).json({ success: true, data: trigger });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateTriggerSchema.parse(req.body);
    const trigger = await triggerService.updateTrigger(req.params.id, data as Parameters<typeof triggerService.updateTrigger>[1]);
    res.json({ success: true, data: trigger });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await triggerService.deleteTrigger(req.params.id);
    res.json({ success: true, message: 'Trigger deleted' });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/pause', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trigger = await triggerService.setTriggerStatus(req.params.id, 'paused');
    res.json({ success: true, data: trigger });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/resume', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trigger = await triggerService.setTriggerStatus(req.params.id, 'active');
    res.json({ success: true, data: trigger });
  } catch (err) {
    next(err);
  }
});

export default router;
