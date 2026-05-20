import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

export const inventoryRouter = Router();

inventoryRouter.get('/', requireAuth, (req, res) => {
  res.json({
    scope: req.user.role === 'technician' ? req.user.vehicleId : 'all',
    items: []
  });
});
