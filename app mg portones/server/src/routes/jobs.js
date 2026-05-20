import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

export const jobsRouter = Router();

jobsRouter.get('/', requireAuth, (req, res) => {
  const technicianFilter = req.user.role === 'technician' ? 'Solo trabajos propios de los ultimos 7 dias' : 'Todos los trabajos';
  res.json({ scope: technicianFilter, items: [] });
});

jobsRouter.post('/', requireAuth, (req, res) => {
  const { cost, ...job } = req.body;

  res.status(201).json({
    id: crypto.randomUUID(),
    ...job,
    pdfStatus: 'queued',
    syncStatus: 'synced'
  });
});
