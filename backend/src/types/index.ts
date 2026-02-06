import { Request } from 'express';

// ============ Database Entities ============

export interface IUser {
  _id: string;
  telegramId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  isAllowed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAdmin {
  _id: string;
  username: string;
  password: string;
  createdAt: Date;
}

export interface IDomain {
  _id: string;
  name: string;
  zoneId: string;
  nameServers: string[];
  status: DomainStatus;
  createdAt: Date;
  updatedAt: Date;
}

// ============ Enums ============

export type DomainStatus = 'active' | 'pending' | 'initializing' | 'moved' | 'deleted';

export type DNSRecordType = 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS' | 'SRV' | 'CAA';

// ============ Cloudflare Types ============

export interface CloudflareZone {
  id: string;
  name: string;
  status: string;
  name_servers: string[];
  created_on: string;
  modified_on: string;
}

export interface CloudflareDNSRecord {
  id: string;
  type: string;
  name: string;
  content: string;
  ttl: number;
  proxied: boolean;
  created_on?: string;
  modified_on?: string;
}

export interface CloudflareError {
  code: number;
  message: string;
}

export interface CloudflareResponse<T> {
  success: boolean;
  errors: CloudflareError[];
  messages: string[];
  result: T;
}

// ============ API DTOs ============

export interface CreateDomainDTO {
  name: string;
}

export interface CreateDNSRecordDTO {
  type: DNSRecordType;
  name: string;
  content: string;
  ttl?: number;
  proxied?: boolean;
}

export interface UpdateDNSRecordDTO {
  type: DNSRecordType;
  name: string;
  content: string;
  ttl?: number;
  proxied?: boolean;
}

export interface CreateUserDTO {
  telegramId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  isAllowed?: boolean;
}

export interface UpdateUserDTO {
  isAllowed?: boolean;
  username?: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginDTO {
  username: string;
  password: string;
}

// ============ Express Extended Types ============

export interface AuthRequest extends Request {
  adminId?: string;
}

// ============ API Responses ============

export interface ApiError {
  error: string;
  details?: string[];
}

export interface ApiSuccess<T = void> {
  message?: string;
  data?: T;
}
