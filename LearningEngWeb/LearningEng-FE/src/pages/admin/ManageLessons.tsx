import { useState, useEffect, type JSX } from "react";
import { getLessons, deleteLesson } from "@/services/lessonService";
import type { Lesson } from "@/types/lesson.types";
import { useNavigate } from "react-router-dom";
import LessonForm from "@features/admin/components/LessonForm";
import Modal from "react-modal";
import "@styles/pages/ManageLessons.css";

Modal.setAppElement("#root");

const ManageLessons = (): JSX.Element => {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchLessons = async () => {
    try {
      setIsLoading(true);
      const data = await getLessons();
      setLessons(data);
    } catch (err) {
      setError("Không thể tải danh sách bài học.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  const handleEdit = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingLesson(null);
  };

  const handleSuccess = () => {
    handleCloseModal();
    fetchLessons();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài học này?")) {
      try {
        await deleteLesson(id);
        setLessons((prevLessons) =>
          prevLessons.filter((l) => l.lessonId !== id)
        );
        alert("Xóa thành công!");
      } catch (err) {
        alert("Xóa thất bại.");
      }
    }
  };

  if (isLoading)
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <span>Đang tải...</span>
      </div>
    );
  if (error)
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
      </div>
    );

  return (
    <div className="manage-lessons-container">
      <div className="header-section">
        <h1 className="page-title">Quản lý bài học</h1>
        <button className="add-button" onClick={() => setIsModalOpen(true)}>
          <span className="add-icon">+</span>
          Thêm bài học mới
        </button>
      </div>

      <div className="table-container">
        <table className="lessons-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tiêu đề</th>
              <th>Cấp độ</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {lessons.map((lesson) => (
              <tr key={lesson.lessonId}>
                <td className="id-cell">{lesson.lessonId}</td>
                <td className="title-cell">{lesson.title}</td>
                <td>
                  <span>{lesson.level}</span>
                </td>
                <td className="actions-cell">
                  <button
                    className="action-btn edit-btn"
                    onClick={() => handleEdit(lesson)}
                  >
                    <span className="btn-icon">✏️</span>
                    Sửa
                  </button>
                  <button
                    className="action-btn manage-btn"
                    onClick={() =>
                      navigate(`/admin/lessons/${lesson.lessonId}`)
                    }
                  >
                    <span className="btn-icon">⚙️</span>
                    Quản lý
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDelete(lesson.lessonId)}
                  >
                    <span className="btn-icon">🗑️</span>
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
        className="custom-modal"
        overlayClassName="custom-modal-overlay"
      >
        <LessonForm
          onSuccess={handleSuccess}
          onCancel={handleCloseModal}
          initialData={editingLesson}
        />
      </Modal>
    </div>
  );
};

export default ManageLessons;
