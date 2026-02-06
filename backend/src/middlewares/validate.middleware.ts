import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError, ZodIssue } from 'zod';

type ValidationTarget = 'body' | 'params' | 'query';

export const validate = (schema: ZodSchema, target: ValidationTarget = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = schema.parse(req[target]);
      req[target] = data;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((e: ZodIssue) => `${e.path.join('.')}: ${e.message}`);
        return res.status(400).json({
          error: 'Validation failed',
          details: errors,
        });
      }
      next(error);
    }
  };
};
