interface QuizAttempt {
  historyQuizId: number;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  completedDate: string;
}

export interface LessonCompletion {
  lessonId: number;
  lessonTitle: string;
  averageCompletionPercentage: number;
  _AverageCompletionPercentage: number;
}

export interface StudentQuizHistory {
  studentId: string;
  studentFullName: string;
  quizAttempts: QuizAttempt[];
}

export interface AdminStatistics {
  lessonCompletions: LessonCompletion[];
  studentQuizHistories: StudentQuizHistory[];
}

export interface MyLessonProgress {
  lessonId: number;
  lessonTitle: string;
  completionPercentage: number;
  completedActivities: number;
  totalActivities: number;
}

export interface StudentStatistics {
  myLessonProgresses: MyLessonProgress[];
  myQuizAttempts: QuizAttempt[];
}