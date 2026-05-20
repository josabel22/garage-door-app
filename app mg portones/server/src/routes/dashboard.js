import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const dashboardRouter = Router();

dashboardRouter.get('/admin', requireAuth, requireRole('admin'), (_req, res) => {
  res.json({
    todayJobs: 12,
    activeTechnicians: 8,
    lowStock: 5,
    pendingAppointments: 9,
    completedJobs: 34,
    alerts: ['3 moviles con stock bajo', '2 garantias vencen esta semana']
  });
});
