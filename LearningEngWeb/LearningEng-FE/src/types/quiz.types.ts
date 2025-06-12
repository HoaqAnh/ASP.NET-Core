export interface Question {
  questionId: number;
  content: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
}

export interface Quiz {
  quizId: number;
  title: string;
  lessonId: number;
  questions: Question[];
}

export type QuestionPayload = Omit<Question, 'questionId'>;
export type UpdateQuestionPayload = Question;

export interface CreateQuizPayload {
  title: string;
  lessonId: number;
  questions: QuestionPayload[];
}

export interface UpdateQuizPayload {
  title: string;
  lessonId: number;
  questions: UpdateQuestionPayload[];
}

export interface QuizInfo {
  quizId: number;
  title: string;
  lessonId: number;
}