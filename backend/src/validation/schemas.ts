import { z } from 'zod';

const DNS_RECORD_TYPES = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SRV', 'CAA'] as const;

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const createDomainSchema = z.object({
  name: z
    .string()
    .min(1, 'Domain name is required')
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/, 'Invalid domain format'),
});

export const createDNSRecordSchema = z.object({
  type: z.enum(DNS_RECORD_TYPES),
  name: z.string().min(1, 'Name is required'),
  content: z.string().min(1, 'Content is required'),
  ttl: z.number().int().min(1).max(86400).optional().default(3600),
  proxied: z.boolean().optional().default(false),
});

export const updateDNSRecordSchema = z.object({
  type: z.enum(DNS_RECORD_TYPES),
  name: z.string().min(1, 'Name is required'),
  content: z.string().min(1, 'Content is required'),
  ttl: z.number().int().min(1).max(86400).optional().default(3600),
  proxied: z.boolean().optional().default(false),
});

export const createUserSchema = z.object({
  telegramId: z.number().int().positive('Invalid Telegram ID'),
  username: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  isAllowed: z.boolean().optional().default(true),
});

export const updateUserSchema = z.object({
  isAllowed: z.boolean().optional(),
  username: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export const mongoIdSchema = z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid ID format');

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateDomainInput = z.infer<typeof createDomainSchema>;
export type CreateDNSRecordInput = z.infer<typeof createDNSRecordSchema>;
export type UpdateDNSRecordInput = z.infer<typeof updateDNSRecordSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
