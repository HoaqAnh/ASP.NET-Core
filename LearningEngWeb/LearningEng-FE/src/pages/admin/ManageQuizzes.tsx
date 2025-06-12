import { useState, useEffect, type JSX } from "react";
import { getQuizzes, getQuizDetails, deleteQuiz } from "@/services/quizService";
import type { QuizInfo, Quiz } from "@/types/quiz.types";
import QuizForm from "@/components/admin/QuizForm";
import Modal from "react-modal";

import "@styles/pages/ManageQuizzes.css";

Modal.setAppElement("#root");

const ManageQuizzes = (): JSX.Element => {
  const [quizzes, setQuizzes] = useState<QuizInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);

  const fetchQuizzes = () => {
    setIsLoading(true);
    getQuizzes()
      .then((data) => setQuizzes(data))
      .catch(() => setError("Không thể tải danh sách quiz."))
      .finally(() => setIsLoading(false));
  };

  useEffect(fetchQuizzes, []);

  const handleEdit = async (quizId: number) => {
    try {
      const fullQuizData = await getQuizDetails(quizId);
      setEditingQuiz(fullQuizData);
      setIsModalOpen(true);
    } catch (err) {
      alert("Không thể lấy dữ liệu chi tiết của quiz.");
    }
  };

  const handleDelete = async (quizId: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài quiz này?")) {
      try {
        await deleteQuiz(quizId);
        setQuizzes((prev) => prev.filter((q) => q.quizId !== quizId));
        alert("Xóa thành công!");
      } catch (err) {
        alert("Xóa thất bại.");
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingQuiz(null);
  };

  const handleSuccess = () => {
    handleCloseModal();
    fetchQuizzes();
  };

  if (isLoading) return <div className="mq-loading">Đang tải...</div>;
  if (error) return <div className="mq-error">{error}</div>;

  return (
    <div className="mq-container">
      <div className="mq-header">
        <h1 className="mq-header__title">Quản lý toàn bộ Quiz</h1>
        {/* Có thể thêm nút "Tạo Quiz mới" ở đây trong tương lai */}
      </div>

      <div className="mq-table-wrapper">
        <table className="mq-table">
          <thead className="mq-table__head">
            <tr className="mq-table__row">
              <th className="mq-table__cell mq-table__cell--header">ID Quiz</th>
              <th className="mq-table__cell mq-table__cell--header">Tiêu đề</th>
              <th className="mq-table__cell mq-table__cell--header">
                Thuộc bài học (ID)
              </th>
              <th className="mq-table__cell mq-table__cell--header mq-table__cell--actions">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="mq-table__body">
            {quizzes.map((quiz) => (
              <tr key={quiz.quizId} className="mq-table__row">
                <td className="mq-table__cell">{quiz.quizId}</td>
                <td className="mq-table__cell">{quiz.title}</td>
                <td className="mq-table__cell">{quiz.lessonId}</td>
                <td className="mq-table__cell mq-table__cell--actions">
                  <button
                    onClick={() => handleEdit(quiz.quizId)}
                    className="mq-actions__button mq-actions__button--edit"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(quiz.quizId)}
                    className="mq-actions__button mq-actions__button--delete"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        className="quiz-modal-content"
        overlayClassName="quiz-modal-overlay"
      >
        <button onClick={handleCloseModal} className="quiz-modal-close-btn">
          &times;
        </button>
        {editingQuiz && (
          <QuizForm
            lessonId={editingQuiz.lessonId}
            initialData={editingQuiz}
            onSuccess={handleSuccess}
            onCancel={handleCloseModal}
          />
        )}
      </Modal>
    </div>
  );
};

export default ManageQuizzes;
