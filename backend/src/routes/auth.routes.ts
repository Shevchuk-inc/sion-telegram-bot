import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Admin } from '../models';
import { config } from '../config';

const router = Router();

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: 'Username and password are required' });
      return;
    }

    const admin = await Admin.findOne({ username });

    if (!admin) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ id: admin._id }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    res.json({ token, username: admin.username });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

export const authRouter = router;
