import axios from 'axios';
import type {
  User,
  Domain,
  DNSRecord,
  AuthResponse,
  DomainWithDNS,
  CreateUserPayload,
  UpdateUserPayload,
  CreateDomainPayload,
  CreateDNSRecordPayload,
  UpdateDNSRecordPayload,
} from '../types';

const TOKEN_KEY = 'token';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (username: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { username, password }),
};

export const usersApi = {
  getAll: () => api.get<User[]>('/users'),
  create: (data: CreateUserPayload) => api.post<User>('/users', data),
  update: (id: string, data: UpdateUserPayload) => api.patch<User>(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};

export const domainsApi = {
  getAll: () => api.get<Domain[]>('/domains'),
  getById: (id: string) => api.get<DomainWithDNS>(`/domains/${id}`),
  create: (data: CreateDomainPayload) => api.post<Domain>('/domains', data),
  delete: (id: string) => api.delete(`/domains/${id}`),
  getDNS: (domainId: string) => api.get<DNSRecord[]>(`/domains/${domainId}/dns`),
  createDNS: (domainId: string, data: CreateDNSRecordPayload) =>
    api.post<DNSRecord>(`/domains/${domainId}/dns`, data),
  updateDNS: (domainId: string, recordId: string, data: UpdateDNSRecordPayload) =>
    api.put<DNSRecord>(`/domains/${domainId}/dns/${recordId}`, data),
  deleteDNS: (domainId: string, recordId: string) =>
    api.delete(`/domains/${domainId}/dns/${recordId}`),
};

export default api;
