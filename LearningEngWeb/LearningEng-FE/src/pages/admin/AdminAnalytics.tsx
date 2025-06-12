import { useState, useEffect, useMemo, type JSX } from "react";
import { getAdminStatistics } from "@/services/statisticsService";
import type { AdminStatistics } from "@/types/statistics.types";

import "@styles/pages/AdminAnalytics.css";

const AdminAnalytics = (): JSX.Element => {
  const [stats, setStats] = useState<AdminStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(
    null
  );

  useEffect(() => {
    getAdminStatistics()
      .then(setStats)
      .finally(() => setIsLoading(false));
  }, []);

  const filteredStudents = useMemo(() => {
    if (!stats) return [];
    return stats.studentQuizHistories.filter((student) =>
      student.studentFullName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [stats, searchTerm]);

  const toggleStudentExpansion = (studentId: string) => {
    setExpandedStudentId((prevId) => (prevId === studentId ? null : studentId));
  };

  if (isLoading)
    return <div className="aa-container">Đang tải dữ liệu thống kê...</div>;
  if (!stats) return <div className="aa-container">Không có dữ liệu.</div>;

  return (
    <div className="aa-container">
      <header className="aa-header">
        <h1 className="aa-header__title">Thống kê tổng quan</h1>
      </header>

      <section className="aa-section">
        <h2 className="aa-section__title">Mức độ hoàn thành bài học</h2>
        <div className="aa-widget">
          <ul className="aa-completions-list">
            {stats.lessonCompletions.map((lesson) => (
              <li key={lesson.lessonId} className="aa-completions-item">
                <div className="aa-completions-item__header">
                  <span className="aa-completions-item__title">
                    {lesson.lessonTitle}
                  </span>
                  <span className="aa-completions-item__percentage">
                    {Math.round(lesson._AverageCompletionPercentage)}%
                  </span>
                </div>
                <div className="aa-progress-bar">
                  <div
                    className="aa-progress-bar__inner"
                    style={{ width: `${lesson._AverageCompletionPercentage}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="aa-section">
        <h2 className="aa-section__title">Lịch sử làm Quiz của học viên</h2>
        <input
          type="text"
          placeholder="Tìm kiếm học viên theo tên..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="aa-search-input"
        />

        <div className="aa-accordion">
          {filteredStudents.map((student) => (
            <div
              key={student.studentId}
              className={`aa-accordion__item ${
                expandedStudentId === student.studentId ? "is-expanded" : ""
              }`}
            >
              <div
                onClick={() => toggleStudentExpansion(student.studentId)}
                className="aa-accordion__header"
              >
                <b className="aa-accordion__student-name">
                  {student.studentFullName}
                </b>
                <span className="aa-accordion__toggle-icon">▼</span>
              </div>
              <div className="aa-accordion__body">
                {student.quizAttempts.length > 0 ? (
                  <table className="aa-history-table">
                    <thead>
                      <tr>
                        <th>Bài Quiz</th>
                        <th>Điểm</th>
                        <th>Ngày làm</th>
                      </tr>
                    </thead>
                    <tbody>
                      {student.quizAttempts.map((attempt) => (
                        <tr key={attempt.historyQuizId}>
                          <td>{attempt.quizTitle}</td>
                          <td>
                            <strong>
                              {attempt.score}/{attempt.totalQuestions}
                            </strong>
                          </td>
                          <td>
                            <i>
                              {new Date(attempt.completedDate).toLocaleString(
                                "vi-VN"
                              )}
                            </i>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>Chưa có lịch sử làm bài quiz.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminAnalytics;
