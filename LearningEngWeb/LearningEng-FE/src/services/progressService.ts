import axios from 'axios';
import type { MarkProgressPayload } from '@/types/progress.types';

const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/progress`,
});

apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    if (!config.headers) {
      config.headers = {};
    }
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const markActivityAsCompleted = async (payload: MarkProgressPayload): Promise<void> => {
  await apiClient.post('/mark-completed', payload);
};