import { Router } from 'express';
import jwt from 'jsonwebtoken';

export const authRouter = Router();

const demoUsers = [
  { id: '1', username: 'admin', password: 'admin123', role: 'admin', name: 'Administrador' },
  { id: '2', username: 'tecnico1', password: 'tecnico123', role: 'technician', name: 'Carlos Tecnico', vehicleId: 'MOV-01' },
  { id: '3', username: 'cliente1', password: 'cliente123', role: 'client', name: 'Cliente Demo' }
];

authRouter.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = demoUsers.find((item) => item.username === username && item.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Credenciales invalidas' });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role, name: user.name, vehicleId: user.vehicleId },
    process.env.JWT_SECRET || 'change-me',
    { expiresIn: '8h' }
  );

  return res.json({ token, user: { id: user.id, role: user.role, name: user.name, vehicleId: user.vehicleId } });
});
