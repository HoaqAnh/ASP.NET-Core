import type { Quiz } from "./quiz.types";

export interface Reading {
  readingId: number;
  title: string;
  readingContent: string;
}

export interface Listening {
  listeningId: number;
  title: string;
  audioUrl: string;
}

export interface Writing {
  writingId: number;
  title: string;
  content: string;
}

export interface Lesson {
  lessonId: number;
  title: string;
  description: string;
  content: string | null;
  level: string;
  readings: Reading[];
  listenings: Listening[];
  writings: Writing[];
  quizzes: Quiz[];
}

export type Activity =
  | { type: "reading"; data: Reading }
  | { type: "listening"; data: Listening }
  | { type: "writing"; data: Writing };

export type CreateLessonPayload = Omit<
  Lesson,
  "lessonId" | "readings" | "listenings" | "writings"
>;
