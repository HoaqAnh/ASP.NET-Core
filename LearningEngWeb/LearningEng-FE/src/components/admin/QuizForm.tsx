import { useState, useEffect, type JSX } from 'react';
import type { Quiz, QuestionPayload, CreateQuizPayload ,UpdateQuizPayload, UpdateQuestionPayload } from '@/types/quiz.types';
import { createQuiz, updateQuiz } from '@/services/quizService';

interface QuizFormProps {
  lessonId: number;
  initialData?: Quiz | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const emptyQuestion: QuestionPayload = { content: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A' };

const QuizForm = ({ lessonId, initialData, onSuccess, onCancel }: QuizFormProps): JSX.Element => {
  const isEditMode = !!initialData;
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<(QuestionPayload | UpdateQuestionPayload)[]>([emptyQuestion]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode && initialData) {
      setTitle(initialData.title);
      setQuestions(initialData.questions.length > 0 ? initialData.questions : [emptyQuestion]);
    }
  }, [initialData, isEditMode]);

  const handleQuestionChange = (index: number, field: keyof QuestionPayload, value: string) => {
    const newQuestions = [...questions];
    (newQuestions[index] as any)[field] = value;
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, { ...emptyQuestion, questionId: 0 }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) {
      alert('Một bài quiz phải có ít nhất một câu hỏi.');
      return;
    }
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isEditMode && initialData) {
        const payload: UpdateQuizPayload = { title, lessonId, questions: questions as UpdateQuestionPayload[] };
        await updateQuiz(initialData.quizId, payload);
        alert('Cập nhật Quiz thành công!');
      } else {
        const payload: CreateQuizPayload = { title, lessonId, questions: questions as QuestionPayload[] };
        await createQuiz(payload);
        alert('Tạo Quiz thành công!');
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxHeight: '80vh', overflowY: 'auto', padding: '20px' }}>
      <h2>{isEditMode ? 'Chỉnh sửa Quiz' : 'Thêm Quiz mới'}</h2>
      {error && <p style={{color: 'red'}}>{error}</p>}
      
      <div>
        <label><b>Tiêu đề Quiz:</b></label>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} required style={{width: '95%', margin: '10px 0'}}/>
      </div>

      <hr/>

      {questions.map((q, index) => (
        <fieldset key={index} style={{marginBottom: '15px'}}>
          <legend>Câu hỏi {index + 1}</legend>
          <button type="button" onClick={() => removeQuestion(index)} style={{float: 'right'}}>Xóa câu hỏi</button>
          
          <label>Nội dung câu hỏi:</label>
          <textarea value={q.content} onChange={e => handleQuestionChange(index, 'content', e.target.value)} required rows={3} style={{width: '100%'}}/>
          
          <label>Đáp án A:</label><input type="text" value={q.optionA} onChange={e => handleQuestionChange(index, 'optionA', e.target.value)} required />
          <label>Đáp án B:</label><input type="text" value={q.optionB} onChange={e => handleQuestionChange(index, 'optionB', e.target.value)} required />
          <label>Đáp án C:</label><input type="text" value={q.optionC} onChange={e => handleQuestionChange(index, 'optionC', e.target.value)} required />
          <label>Đáp án D:</label><input type="text" value={q.optionD} onChange={e => handleQuestionChange(index, 'optionD', e.target.value)} required />

          <label>Đáp án đúng:</label>
          <select value={q.correctAnswer} onChange={e => handleQuestionChange(index, 'correctAnswer', e.target.value)}>
            <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
          </select>
        </fieldset>
      ))}

      <button type="button" onClick={addQuestion}>Thêm câu hỏi</button>
      <hr/>
      <button type="submit" disabled={isLoading}>{isLoading ? 'Đang xử lý...' : 'Lưu Quiz'}</button>
      <button type="button" onClick={onCancel} style={{marginLeft: '10px'}}>Hủy</button>
    </form>
  );
};

export default QuizForm;