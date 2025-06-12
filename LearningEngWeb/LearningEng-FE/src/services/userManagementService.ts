import axios from 'axios';
import type { Student } from '@/types/userManagement.types';

const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/user-management`,
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

export const getStudents = async (): Promise<Student[]> => {
  const response = await apiClient.get<Student[]>('/students');
  return response.data;
};

export const toggleStudentStatus = async (id: string): Promise<{ isEnabled: boolean }> => {
  const response = await apiClient.patch<{ isEnabled: boolean }>(`/students/${id}/toggle-status`);
  return response.data;
};