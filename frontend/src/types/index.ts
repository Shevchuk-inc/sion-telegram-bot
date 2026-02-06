export interface User {
  _id: string;
  telegramId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  isAllowed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Domain {
  _id: string;
  name: string;
  zoneId: string;
  nameServers: string[];
  status: DomainStatus;
  createdAt: string;
  updatedAt: string;
}

export type DomainStatus = 'active' | 'pending' | 'initializing' | 'moved' | 'deleted';

export interface DNSRecord {
  id: string;
  type: DNSRecordType;
  name: string;
  content: string;
  ttl: number;
  proxied: boolean;
}

export type DNSRecordType = 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS' | 'SRV' | 'CAA';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
}

export interface ApiError {
  error: string;
  details?: string[];
}

export interface DomainWithDNS {
  domain: Domain;
  dnsRecords: DNSRecord[];
}

export interface CreateDomainPayload {
  name: string;
}

export interface CreateDNSRecordPayload {
  type: DNSRecordType;
  name: string;
  content: string;
  ttl?: number;
  proxied?: boolean;
}

export interface UpdateDNSRecordPayload extends CreateDNSRecordPayload {}

export interface CreateUserPayload {
  telegramId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  isAllowed?: boolean;
}

export interface UpdateUserPayload {
  isAllowed?: boolean;
}
