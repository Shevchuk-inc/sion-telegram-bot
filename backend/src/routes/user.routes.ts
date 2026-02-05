import { Router, Request, Response } from 'express';
import { User } from '../models';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', async (_req: Request, res: Response) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { telegramId, username, isAllowed = true } = req.body;

    if (!telegramId || !username) {
      res.status(400).json({ error: 'telegramId and username are required' });
      return;
    }

    const existingUser = await User.findOne({ telegramId });
    if (existingUser) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    const user = await User.create({ telegramId, username, isAllowed });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { isAllowed } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isAllowed },
      { new: true }
    );

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export const userRouter = router;
