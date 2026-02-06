import { Router, Response } from 'express';
import { User } from '../models';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { asyncHandler, AppError } from '../middlewares/error.middleware';
import { createUserSchema, updateUserSchema } from '../validation/schemas';
import { AuthRequest } from '../types';

const router = Router();

router.use(authMiddleware);

router.get(
  '/',
  asyncHandler(async (_req: AuthRequest, res: Response) => {
    const users = await User.find().sort({ createdAt: -1 }).lean();
    res.json(users);
  })
);

router.post(
  '/',
  validate(createUserSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { telegramId, username, firstName, lastName, isAllowed } = req.body;

    const existingUser = await User.findOne({ telegramId });
    if (existingUser) {
      throw new AppError(400, 'User already exists');
    }

    const user = await User.create({ telegramId, username, firstName, lastName, isAllowed });
    res.status(201).json(user);
  })
);

router.patch(
  '/:id',
  validate(updateUserSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    res.json(user);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    res.json({ message: 'User deleted' });
  })
);

export const userRouter = router;
