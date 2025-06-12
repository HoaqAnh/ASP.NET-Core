import axios from 'axios';
import type { Lesson } from '@/types/lesson.types';

const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/lessons`,
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
}, error => {
  return Promise.reject(error);
});


export const getLessons = async (): Promise<Lesson[]> => {
  const response = await apiClient.get<Lesson[]>('/');
  return response.data;
};

export const createLessonWithActivities = async (formData: FormData): Promise<Lesson> => {
    const response = await apiClient.post<Lesson>('/', formData);
    return response.data;
};

export const updateLesson = async (id: number, formData: FormData): Promise<void> => {
  await apiClient.put(`/${id}`, formData);
};

export const deleteLesson = async (id: number): Promise<void> => {
  await apiClient.delete(`/${id}`);
};

export const getLessonDetails = async (id: number): Promise<Lesson> => {
  const response = await apiClient.get<Lesson>(`/${id}`);
  return response.data;
};
