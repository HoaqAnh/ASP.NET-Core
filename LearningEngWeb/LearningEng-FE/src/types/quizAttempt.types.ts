export interface UserAnswer {
  questionId: number;
  selectedAnswer: string;
}

export interface SubmitQuizPayload {
  quizId: number;
  answers: UserAnswer[];
}

export interface QuizResult {
  historyId: number;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  completedDate: string;
  questions: {
    questionId: number;
    content: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: string;
    userAnswer: string;
  }[];
}