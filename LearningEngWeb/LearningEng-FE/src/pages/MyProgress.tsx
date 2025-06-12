import { useState, useEffect, type JSX } from "react";
import { getStudentStatistics } from "@/services/statisticsService";
import type { StudentStatistics } from "@/types/statistics.types";

import "@styles/pages/MyProgress.css";

const MyProgress = (): JSX.Element => {
  const [stats, setStats] = useState<StudentStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getStudentStatistics()
      .then(setStats)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading)
    return <div className="mp-container">Đang tải tiến độ học tập...</div>;
  if (!stats) return <div className="mp-container">Không có dữ liệu.</div>;

  return (
    <div className="mp-container">
      <header className="mp-header">
        <h1 className="mp-header__title">Tiến độ học tập của tôi</h1>
      </header>

      <section className="mp-section">
        <h2 className="mp-section__title">Tiến độ bài học</h2>
        <div className="mp-widget">
          <div className="mp-progress-list">
            {stats.myLessonProgresses.map((lesson) => (
              <div key={lesson.lessonId} className="mp-progress-item">
                <div className="mp-progress-item__header">
                  <p className="mp-progress-item__title">
                    {lesson.lessonTitle}
                    <span className="count">
                      ({lesson.completedActivities}/{lesson.totalActivities}{" "}
                      hoạt động)
                    </span>
                  </p>
                  <span className="mp-progress-item__percentage">
                    {Math.round(lesson.completionPercentage)}%
                  </span>
                </div>
                <progress
                  className="mp-progress-bar"
                  value={lesson.completionPercentage}
                  max="100"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mp-section">
        <h2 className="mp-section__title">Lịch sử làm Quiz</h2>
        <div className="mp-widget">
          <ul className="mp-history-list">
            {stats.myQuizAttempts.map((attempt) => (
              <li key={attempt.historyQuizId} className="mp-history-item">
                <span className="mp-history-item__title">
                  {attempt.quizTitle}
                </span>
                <strong className="mp-history-item__score">
                  {attempt.score}/{attempt.totalQuestions}
                </strong>
                <span className="mp-history-item__date">
                  {new Date(attempt.completedDate).toLocaleString("vi-VN")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
};

export default MyProgress;
