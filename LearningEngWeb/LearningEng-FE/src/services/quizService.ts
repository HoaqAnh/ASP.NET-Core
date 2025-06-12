import axios from 'axios';
import type { Quiz, CreateQuizPayload, UpdateQuizPayload, QuizInfo } from '@/types/quiz.types';

const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/quiz`,
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

export const getQuizDetails = async (id: number): Promise<Quiz> => {
  const response = await apiClient.get<Quiz>(`/${id}`);
  return response.data;
};

export const createQuiz = async (data: CreateQuizPayload): Promise<Quiz> => {
  const response = await apiClient.post<Quiz>('/', data);
  return response.data;
};

export const updateQuiz = async (id: number, data: UpdateQuizPayload): Promise<void> => {
  await apiClient.put(`/${id}`, data);
};

export const deleteQuiz = async (id: number): Promise<void> => {
  await apiClient.delete(`/${id}`);
};

export const getQuizzes = async (): Promise<QuizInfo[]> => {
  const response = await apiClient.get<QuizInfo[]>('/');
  return response.data;
};