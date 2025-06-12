import { useState, useEffect, type JSX } from "react";
import { getLessons } from "@/services/lessonService";
import type { Lesson } from "@/types/lesson.types";
import LessonCard from "@/components/lesson/LessonCard";
import "@styles/pages/LessonListPage.css";

const LessonListPage = (): JSX.Element => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getLessons()
      .then((data) => {
        setLessons(data);
      })
      .catch(() => {
        setError("Không thể tải danh sách bài học. Vui lòng thử lại sau.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) return <div>Đang tải bài học...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div className="lesson-list-page">
      <h1>Danh sách bài học</h1>
      <p>Hãy chọn một bài học để bắt đầu hành trình của bạn!</p>
      <div className="lesson-grid">
        {lessons.map((lesson) => (
          <LessonCard key={lesson.lessonId} lesson={lesson} />
        ))}
      </div>
    </div>
  );
};

export default LessonListPage;
