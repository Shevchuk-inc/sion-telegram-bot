import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (username: string, password: string) =>
    api.post<{ token: string; username: string }>('/auth/login', { username, password }),
};

export interface User {
  _id: string;
  telegramId: string;
  username: string;
  isAllowed: boolean;
  createdAt: string;
}

export const usersApi = {
  getAll: () => api.get<User[]>('/users'),
  create: (data: { telegramId: string; username: string }) => api.post<User>('/users', data),
  update: (id: string, isAllowed: boolean) => api.patch<User>(`/users/${id}`, { isAllowed }),
  delete: (id: string) => api.delete(`/users/${id}`),
};

export default api;
