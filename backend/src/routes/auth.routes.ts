import { Router, Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { Admin } from '../models';
import { config } from '../config';
import { validate } from '../middlewares/validate.middleware';
import { asyncHandler, AppError } from '../middlewares/error.middleware';
import { loginSchema } from '../validation/schemas';
import { logger } from '../services/logger.service';

const router = Router();

router.post(
  '/login',
  validate(loginSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });
    if (!admin) {
      logger.warn(`Login attempt with unknown username: ${username}`, 'Auth');
      throw new AppError(401, 'Invalid credentials');
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      logger.warn(`Invalid password for user: ${username}`, 'Auth');
      throw new AppError(401, 'Invalid credentials');
    }

    const token = jwt.sign({ id: admin._id }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    } as SignOptions);

    logger.info(`User logged in: ${username}`, 'Auth');
    res.json({ token, username: admin.username });
  })
);

export const authRouter = router;
