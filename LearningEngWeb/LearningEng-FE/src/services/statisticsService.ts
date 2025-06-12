import axios from 'axios';
import type { AdminStatistics, StudentStatistics } from '@/types/statistics.types';

const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/statistics`,
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

export const getAdminStatistics = async (): Promise<AdminStatistics> => {
  const response = await apiClient.get<AdminStatistics>('/admin');
  return response.data;
};

export const getStudentStatistics = async (): Promise<StudentStatistics> => {
  const response = await apiClient.get<StudentStatistics>('/student');
  return response.data;
};