import { Router } from 'express';
import type { Request, Response } from 'express';
import { getSnapshotInfo } from '../db/queries/index.js';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const info = getSnapshotInfo();
  res.json(info);
});

export default router;
