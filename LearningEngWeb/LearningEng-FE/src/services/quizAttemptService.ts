import axios from 'axios';
import type { SubmitQuizPayload, QuizResult } from '@/types/quizAttempt.types';

const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/quiz-attempts`,
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

export const submitQuiz = async (payload: SubmitQuizPayload): Promise<{ historyQuizId: number }> => {
  const response = await apiClient.post<{ historyQuizId: number }>('/submit', payload);
  return response.data;
};

export const getQuizResult = async (historyId: number): Promise<QuizResult> => {
  const response = await apiClient.get<QuizResult>(`/${historyId}`);
  return response.data;
};