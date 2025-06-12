import { useState, useEffect, type JSX } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLessonDetails } from '@/services/lessonService';
import { deleteQuiz } from '@/services/quizService';
import type { Lesson } from '@/types/lesson.types';
import QuizForm from '@/components/admin/QuizForm';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const LessonDashboard = (): JSX.Element => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const numericLessonId = Number(lessonId);

  const fetchLesson = () => {
    setIsLoading(true);
    getLessonDetails(numericLessonId)
      .then(data => setLesson(data))
      .finally(() => setIsLoading(false));
  };

  useEffect(fetchLesson, [numericLessonId]);

  const handleQuizSuccess = () => {
    setIsModalOpen(false);
    fetchLesson();
  };

  const handleQuizDelete = async (quizId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài quiz này?')) {
      try {
        await deleteQuiz(quizId);
        alert('Xóa thành công!');
        fetchLesson();
      } catch (err) {
        alert('Xóa thất bại.');
      }
    }
  };
  
  if (isLoading) return <div>Đang tải...</div>;
  if (!lesson) return <div>Không tìm thấy bài học.</div>;

  const hasQuiz = lesson.quizzes && lesson.quizzes.length > 0;
  const quizData = hasQuiz ? lesson.quizzes[0] : null;

  return (
    <div>
      <button onClick={() => navigate('/admin/lessons')}>&larr; Quay lại danh sách</button>
      <h1>Bảng điều khiển: {lesson.title}</h1>

      <div style={{border: '1px solid black', padding: '1em', marginTop: '1em'}}>
        <h3>Quản lý Quiz</h3>
        {hasQuiz && quizData ? (
          <div>
            <p>Đã có bài quiz: <strong>{quizData.title}</strong></p>
            <button onClick={() => setIsModalOpen(true)}>Sửa Quiz</button>
            <button onClick={() => handleQuizDelete(quizData.quizId)} style={{marginLeft: '10px', backgroundColor: 'red', color: 'white'}}>Xóa Quiz</button>
          </div>
        ) : (
          <div>
            <p>Bài học này chưa có bài quiz.</p>
            <button onClick={() => setIsModalOpen(true)}>Thêm Quiz mới</button>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onRequestClose={() => setIsModalOpen(false)}>
        <QuizForm 
          lessonId={numericLessonId}
          initialData={quizData}
          onSuccess={handleQuizSuccess}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default LessonDashboard;